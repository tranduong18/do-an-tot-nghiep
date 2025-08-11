package vn.jobhunter.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import vn.jobhunter.domain.Company;
import vn.jobhunter.domain.Job;
import vn.jobhunter.domain.User;
import vn.jobhunter.domain.response.ResultPaginationDTO;
import vn.jobhunter.repository.*;
import vn.jobhunter.util.SecurityUtil;
import vn.jobhunter.util.error.IdInvalidException;

@Service
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ReviewRepository reviewRepository;
    private final ResumeRepository resumeRepository;
    private final FavoriteJobRepository favoriteJobRepository;

    public CompanyService(CompanyRepository companyRepository, UserRepository userRepository, JobRepository jobRepository,
                          ReviewRepository reviewRepository, ResumeRepository resumeRepository, FavoriteJobRepository favoriteJobRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.reviewRepository = reviewRepository;
        this.resumeRepository = resumeRepository;
        this.favoriteJobRepository = favoriteJobRepository;
    }

    // Tạo công ty
    public Company handleCreateCompany(Company c) {
        User currentUser = userRepository.findByEmail(SecurityUtil.getCurrentUserLogin().orElseThrow());
        if ("HR".equals(currentUser.getRole().getName())) {
            // HR chỉ tạo được cho công ty của mình
            if (currentUser.getCompany() == null) {
                throw new AccessDeniedException("HR chưa thuộc công ty nào");
            }
            if (c.getId() != currentUser.getCompany().getId()) {
                throw new AccessDeniedException("Bạn không thể tạo công ty khác");
            }
        }
        return this.companyRepository.save(c);
    }

    // Lấy danh sách công ty
    public ResultPaginationDTO handleGetCompany(Specification<Company> spec, Pageable pageable, String adminView) {
        User currentUser = userRepository.findByEmail(SecurityUtil.getCurrentUserLogin().orElseThrow());
        if ("true".equalsIgnoreCase(adminView) && "HR".equals(currentUser.getRole().getName())) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("id"), currentUser.getCompany().getId())
            );
        }

        Page<Company> pCompany = this.companyRepository.findAll(spec, pageable);

        List<Object[]> rows = this.jobRepository.countOpenJobsGroupByCompany();
        Map<Long, Integer> openJobsMap = new HashMap<>();
        for (Object[] r : rows) {
            Long companyId = (Long) r[0];
            Long cnt = (Long) r[1];
            openJobsMap.put(companyId, cnt.intValue());
        }
        pCompany.getContent().forEach(c ->
                c.setOpenJobs(openJobsMap.getOrDefault(c.getId(), 0))
        );

        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();
        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(pCompany.getTotalPages());
        mt.setTotal(pCompany.getTotalElements());

        rs.setMeta(mt);
        rs.setResult(pCompany.getContent());

        return rs;
    }

    // Cập nhật công ty
    public Company handleUpdateCompany(Company c) throws IdInvalidException {
        User currentUser = userRepository.findByEmail(SecurityUtil.getCurrentUserLogin().orElseThrow());
        Optional<Company> companyOptional = this.companyRepository.findById(c.getId());

        if (companyOptional.isEmpty()) {
            throw new IdInvalidException("Company không tồn tại");
        }

        Company currentCompany = companyOptional.get();

        if ("HR".equals(currentUser.getRole().getName()) &&
                currentCompany.getId() != currentUser.getCompany().getId()) {
            throw new AccessDeniedException("Bạn không có quyền sửa công ty này");
        }

        currentCompany.setLogo(c.getLogo());
        currentCompany.setName(c.getName());
        currentCompany.setDescription(c.getDescription());
        currentCompany.setAddress(c.getAddress());
        currentCompany.setCountry(c.getCountry());
        currentCompany.setWebsite(c.getWebsite());
        currentCompany.setIndustry(c.getIndustry());
        currentCompany.setSize(c.getSize());
        currentCompany.setModel(c.getModel());
        currentCompany.setWorkingTime(c.getWorkingTime());
        currentCompany.setOvertimePolicy(c.getOvertimePolicy());
        currentCompany.setBenefits(c.getBenefits());
        currentCompany.setTags(c.getTags());

        return this.companyRepository.save(currentCompany);
    }

    // Xóa công ty
    @Transactional
    public void handleDeleteCompany(long id) throws IdInvalidException {
        User currentUser = userRepository.findByEmail(SecurityUtil.getCurrentUserLogin().orElseThrow());
        Optional<Company> comOptional = this.companyRepository.findById(id);

        if (comOptional.isEmpty()) {
            throw new IdInvalidException("Company không tồn tại");
        }

        Company com = comOptional.get();

        if ("HR".equals(currentUser.getRole().getName()) &&
                com.getId() != currentUser.getCompany().getId()) {
            throw new AccessDeniedException("Bạn không có quyền xóa công ty này");
        }

        // Xóa toàn bộ user, job thuộc công ty này
        List<User> users = this.userRepository.findByCompany(com);
        List<Job> jobs  = this.jobRepository.findByCompany(com);

        if (!users.isEmpty()) {
            favoriteJobRepository.deleteByUserIn(users);
            reviewRepository.deleteByUserIn(users);
            // (tùy chọn) nếu muốn xoá resume của các user này (nếu có FK user_id)
            resumeRepository.deleteByUserIn(users);
        }

        // 2.2 Resume ứng tuyển vào các Job của công ty
        if (!jobs.isEmpty()) {
            favoriteJobRepository.deleteByJobIn(jobs);
            resumeRepository.deleteByJobIn(jobs);
        }

        // 2.3 Review gắn trực tiếp với công ty (nếu bảng review có cột company_id)
        reviewRepository.deleteByCompany(com);

        // 3) Xóa jobs của công ty
        if (!jobs.isEmpty()) {
            jobRepository.deleteAll(jobs);
            // hoặc: jobRepository.deleteByCompany(com);
        }

        // 4) Xóa users thuộc công ty
        if (!users.isEmpty()) {
            userRepository.deleteAll(users);
        }
        this.companyRepository.deleteById(id);
    }

    public Optional<Company> findById(long id) {
        return this.companyRepository.findById(id);
    }
}
