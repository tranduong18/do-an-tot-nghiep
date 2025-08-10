// src/main/java/vn/jobhunter/service/BlogService.java
package vn.jobhunter.service;

import java.text.Normalizer;
import java.util.List;
import java.util.Optional;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import vn.jobhunter.domain.Blog;
import vn.jobhunter.domain.Company;
import vn.jobhunter.domain.User;
import vn.jobhunter.domain.request.ReqBlogCreateDTO;
import vn.jobhunter.domain.request.ReqBlogUpdateDTO;
import vn.jobhunter.domain.response.ResultPaginationDTO;
import vn.jobhunter.domain.response.blog.ResBlogDTO;
import vn.jobhunter.repository.BlogRepository;
import vn.jobhunter.repository.CompanyRepository;
import vn.jobhunter.repository.UserRepository;
import vn.jobhunter.util.SecurityUtil;
import vn.jobhunter.util.error.IdInvalidException;

@Service
public class BlogService {
    private final BlogRepository blogRepo;
    private final CompanyRepository companyRepo;
    private final UserRepository userRepo;

    public BlogService(BlogRepository blogRepo, CompanyRepository companyRepo, UserRepository userRepo) {
        this.blogRepo = blogRepo; this.companyRepo = companyRepo; this.userRepo = userRepo;
    }

    private Optional<String> currentLogin() { return SecurityUtil.getCurrentUserLogin(); }
    private User currentUserOrNull() { return currentLogin().map(userRepo::findByEmail).orElse(null); }
    private boolean isHR(User u){ return u != null && "HR".equals(u.getRole().getName()); }
    private boolean isAdmin(User u){ return u != null && "SUPER_ADMIN".equals(u.getRole().getName()); }

    private String slugify(String input){
        String n = Normalizer.normalize(input, Normalizer.Form.NFD).replaceAll("\\p{M}","");
        String base = n.toLowerCase().replaceAll("[^a-z0-9\\s-]","").replaceAll("\\s+","-")
                .replaceAll("-{2,}","-").replaceAll("^-|-$","");
        String s = base; int i=1; while (blogRepo.existsBySlug(s)) s = base + "-" + (++i);
        return s;
    }
    private String sanitize(String html){
        return Jsoup.clean(html == null ? "" : html,
                Safelist.relaxed().addAttributes(":all","style")
                        .addAttributes("img","src","alt","width","height")
                        .addProtocols("img","src","http","https"));
    }
    private ResBlogDTO toRes(Blog b){
        ResBlogDTO dto = new ResBlogDTO();
        dto.setId(b.getId()); dto.setTitle(b.getTitle()); dto.setSlug(b.getSlug());
        dto.setDescription(b.getDescription()); dto.setContent(b.getContent());
        dto.setThumbnail(b.getThumbnail()); dto.setPublished(b.getPublished());
        dto.setCreatedAt(b.getCreatedAt()); dto.setUpdatedAt(b.getUpdatedAt());
        dto.setCreatedBy(b.getCreatedBy()); dto.setUpdatedBy(b.getUpdatedBy());
        if (b.getCompany()!=null){
            ResBlogDTO.CompanyDTO c = new ResBlogDTO.CompanyDTO();
            c.setId(b.getCompany().getId()); c.setName(b.getCompany().getName()); c.setLogo(b.getCompany().getLogo());
            c.setAddress(b.getCompany().getAddress()); c.setCountry(b.getCompany().getCountry());
            dto.setCompany(c);
        }
        return dto;
    }
    private ResultPaginationDTO toPageDTO(Page<Blog> page, Pageable pageable){
        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();
        mt.setPage(pageable.getPageNumber()+1); mt.setPageSize(pageable.getPageSize());
        mt.setPages(page.getTotalPages()); mt.setTotal(page.getTotalElements());
        rs.setMeta(mt);
        List<ResBlogDTO> items = page.map(this::toRes).getContent();
        rs.setResult(items);
        return rs;
    }

    public ResBlogDTO handleCreateBlog(ReqBlogCreateDTO req) {
        User cu = currentUserOrNull();
        if (cu == null) throw new AccessDeniedException("Unauthorized");

        Blog b = new Blog();
        b.setTitle(req.getTitle());
        b.setDescription(req.getDescription());
        b.setThumbnail(req.getThumbnail());
        b.setContent(sanitize(req.getContent()));
        b.setSlug(slugify(req.getTitle()));
        b.setPublished(Boolean.TRUE.equals(req.getPublished()));

        // long semantics: 0 = system
        long companyId = req.getCompanyId() == 0 ? 0 : req.getCompanyId();

        if (isHR(cu)) {
            if (cu.getCompany() == null) throw new AccessDeniedException("HR chưa thuộc công ty nào");
            long myId = cu.getCompany().getId();
            if (companyId <= 0 || myId != companyId)
                throw new AccessDeniedException("HR chỉ được tạo bài cho công ty của mình");
            b.setCompany(companyRepo.findById(myId).orElseThrow());
        } else if (isAdmin(cu)) {
            if (companyId > 0) {
                b.setCompany(companyRepo.findById(companyId)
                        .orElseThrow(() -> new AccessDeniedException("Company không tồn tại")));
            } else {
                b.setCompany(null);
            }
        }

        b.setCreatedByUser(cu);

        return toRes(blogRepo.save(b));
    }


    public ResultPaginationDTO handleGetBlogsUnified(Specification<Blog> spec, Pageable pageable, String adminView) {
        User cu = currentUserOrNull();

        if (cu == null) {

            spec = spec.and((root, q, cb) -> cb.isTrue(root.get("published")));
        } else {

            if ("true".equalsIgnoreCase(adminView) && isHR(cu)) {
                long myId = cu.getCompany() == null ? -1L : cu.getCompany().getId();
                spec = spec.and((root, q, cb) -> cb.equal(root.get("company").get("id"), myId));
            }

        }

        Pageable eff = pageable.getSort().isUnsorted()
                ? PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createdAt"))
                : pageable;

        Page<Blog> page = blogRepo.findAll(spec, eff);
        return toPageDTO(page, eff);
    }

    public ResBlogDTO findById(long id) throws IdInvalidException {
        Blog b = blogRepo.findById(id)
                .orElseThrow(() -> new IdInvalidException("Blog không tồn tại"));
        return toRes(b);
    }

    public ResBlogDTO getBySlugUnified(String slug) throws IdInvalidException {
        Blog b = blogRepo.findBySlug(slug)
                .orElseThrow(() -> new IdInvalidException("Blog không tồn tại"));
        User cu = currentUserOrNull();
        if (cu == null && !Boolean.TRUE.equals(b.getPublished())) {
            throw new IdInvalidException("Blog chưa publish");
        }

        return toRes(b);
    }

    public ResBlogDTO handleUpdateBlog(ReqBlogUpdateDTO req) throws IdInvalidException {
        User cu = currentUserOrNull();
        if (cu == null) throw new AccessDeniedException("Unauthorized");

        Blog cur = blogRepo.findById(req.getId())
                .orElseThrow(() -> new IdInvalidException("Blog không tồn tại"));

        if (isHR(cu)) {
            long myId = cu.getCompany() == null ? 0 : cu.getCompany().getId();
            long blogCompanyId = cur.getCompany() == null ? 0 : cur.getCompany().getId();
            if (myId == 0 || myId != blogCompanyId)
                throw new AccessDeniedException("Bạn không có quyền sửa bài này");

            if (req.getCompanyId() <= 0 || req.getCompanyId() != myId)
                throw new AccessDeniedException("HR không được đổi công ty của bài viết");
        } else if (isAdmin(cu)) {

            if (req.getCompanyId() <= 0) {
                cur.setCompany(null);
            } else {
                Company c = companyRepo.findById(req.getCompanyId())
                        .orElseThrow(() -> new AccessDeniedException("Company không tồn tại"));
                cur.setCompany(c);
            }
        }

        if (!cur.getTitle().equals(req.getTitle())) cur.setSlug(slugify(req.getTitle()));
        cur.setTitle(req.getTitle());
        cur.setDescription(req.getDescription());
        cur.setThumbnail(req.getThumbnail());
        cur.setContent(sanitize(req.getContent()));
        if (req.getPublished()!=null) cur.setPublished(req.getPublished());

        return toRes(blogRepo.save(cur));
    }

    public void handleDeleteBlog(long id) throws IdInvalidException {
        User cu = currentUserOrNull();
        if (cu == null) throw new AccessDeniedException("Unauthorized");

        Blog cur = blogRepo.findById(id).orElseThrow(() -> new IdInvalidException("Blog không tồn tại"));

        if (isHR(cu)) {
            long myId = cu.getCompany() == null ? 0 : cu.getCompany().getId();
            long blogCompanyId = cur.getCompany() == null ? 0 : cur.getCompany().getId();
            if (myId == 0 || myId != blogCompanyId)
                throw new AccessDeniedException("Bạn không có quyền xoá bài này");
        }
        blogRepo.deleteById(id);
    }

    public List<ResBlogDTO> getRelatedByBlogId(long blogId, int size) throws IdInvalidException {
        Blog base = blogRepo.findById(blogId)
                .orElseThrow(() -> new IdInvalidException("Blog không tồn tại"));
        if (base.getCompany() == null) return List.of(); // blog system => không có công ty

        Pageable p = PageRequest.of(0, Math.max(1, size),
                Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Blog> page = blogRepo.findRelated(base.getCompany().getId(), blogId, p);

        return page.getContent().stream().map(this::toRes).toList();
    }

    public ResultPaginationDTO getBlogsByCompany(Long companyId, Pageable pageable) {
        Pageable eff = pageable.getSort().isUnsorted()
                ? PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "updatedAt"))
                : pageable;

        Page<Blog> page;
        page = blogRepo.findPublishedByCompany(companyId, eff);
        return toPageDTO(page, eff);
    }
}
