package vn.jobhunter.service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.jobhunter.domain.Company;
import vn.jobhunter.domain.Review;
import vn.jobhunter.domain.User;
import vn.jobhunter.domain.response.review.ResReviewDTO;
import vn.jobhunter.repository.*;
import vn.jobhunter.util.SecurityUtil;
import vn.jobhunter.util.error.IdInvalidException;
import vn.jobhunter.domain.response.ResultPaginationDTO;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepo;
    private final CompanyRepository companyRepo;
    private final UserRepository userRepo;

    public ReviewService(ReviewRepository reviewRepo, CompanyRepository companyRepo, UserRepository userRepo) {

        this.reviewRepo = reviewRepo;
        this.userRepo = userRepo;
        this.companyRepo = companyRepo;
    }

    public ResultPaginationDTO getCompanyReviews(long companyId, Pageable pageable) throws IdInvalidException {
        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new IdInvalidException("Company không tồn tại"));

        Page<ResReviewDTO> page = reviewRepo.findByCompany(company, pageable).map(this::toDTO);

        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();
        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(page.getTotalPages());
        mt.setTotal(page.getTotalElements());

        rs.setMeta(mt);
        rs.setResult(page.getContent());
        return rs;
    }

    @Transactional
    public ResReviewDTO createReview(long companyId, Double rating, String content)
            throws IdInvalidException {
        // Lấy user hiện tại
        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("User chưa đăng nhập"));
        User user = userRepo.findByEmail(email);

        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new IdInvalidException("Company không tồn tại"));

        Review r = new Review();
        r.setCompany(company);
        r.setUser(user);
        r.setRating(rating);
        r.setContent(content);
        r.setRecommended(rating != null && rating >= 4.0);

        Review saved = reviewRepo.save(r);

        // cập nhật lại rating/reviewCount/reviewPercent cho company
        recomputeCompanyStats(company.getId());

        return toDTO(saved);
    }

    @Transactional
    public void deleteReview(long companyId, long reviewId) throws IdInvalidException {
        Review r = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new IdInvalidException("Review không tồn tại"));

        if (r.getCompany().getId() != (companyId)) {
            throw new IdInvalidException("Review không thuộc công ty này");
        }

        reviewRepo.delete(r);
        recomputeCompanyStats(companyId);
    }

    @Transactional
    public ResReviewDTO updateReview(long companyId, long reviewId, Double rating, String content)
            throws IdInvalidException {

        String email = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("User chưa đăng nhập"));
        User currentUser = userRepo.findByEmail(email);

        Review review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new IdInvalidException("Review không tồn tại"));

        if (review.getCompany().getId() != companyId) {
            throw new IdInvalidException("Review không thuộc công ty này");
        }

        // Chỉ chủ review hoặc admin mới được sửa
        if (review.getUser().getId() != currentUser.getId()) {
            throw new IdInvalidException("Bạn không có quyền sửa review này");
        }

        review.setRating(rating);
        review.setContent(content);
        review.setRecommended(rating != null && rating >= 4.0);

        Review saved = reviewRepo.save(review);

        recomputeCompanyStats(companyId);

        return toDTO(saved);
    }

    @Transactional
    public void recomputeCompanyStats(long companyId) throws IdInvalidException {
        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new IdInvalidException("Company không tồn tại"));

        long total = reviewRepo.countByCompany(company);
        long recommend = reviewRepo.countByCompanyAndRecommended(company, true);
        double avg = reviewRepo.avgRating(company);

        company.setReviewCount((int) total);
        company.setRating(Math.round(avg * 10.0) / 10.0); // 1 chữ số thập phân
        // % khuyến khích làm việc (1 chữ số thập phân)
        company.setReviewPercent(total == 0 ? 0.0 : Math.round(recommend * 1000.0 / total) / 10.0);

        companyRepo.save(company);
    }

    private ResReviewDTO toDTO(Review r) {
        ResReviewDTO dto = new ResReviewDTO();
        dto.setId(r.getId());
        dto.setRating(r.getRating());
        dto.setContent(r.getContent());
        dto.setRecommended(r.getRecommended());
        dto.setCreatedAt(r.getCreatedAt());

        dto.setCompany(new ResReviewDTO.CompanyInfo(
                r.getCompany().getId(),
                r.getCompany().getName()
        ));
        dto.setUser(new ResReviewDTO.UserInfo(
                r.getUser().getId(),
                r.getUser().getName(),
                r.getUser().getAvatar()
        ));
        return dto;
    }
}
