package vn.jobhunter.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.turkraft.springfilter.builder.FilterBuilder;
import com.turkraft.springfilter.converter.FilterSpecification;
import com.turkraft.springfilter.converter.FilterSpecificationConverter;
import com.turkraft.springfilter.parser.FilterParser;
import com.turkraft.springfilter.parser.node.FilterNode;

import vn.jobhunter.domain.Job;
import vn.jobhunter.domain.Resume;
import vn.jobhunter.domain.User;
import vn.jobhunter.domain.response.ResultPaginationDTO;
import vn.jobhunter.domain.response.resume.ResCreateResumeDTO;
import vn.jobhunter.domain.response.resume.ResFetchResumeDTO;
import vn.jobhunter.domain.response.resume.ResUpdateResumeDTO;
import vn.jobhunter.repository.JobRepository;
import vn.jobhunter.repository.ResumeRepository;
import vn.jobhunter.repository.UserRepository;
import vn.jobhunter.util.SecurityUtil;
import vn.jobhunter.util.error.IdInvalidException;

@Service
public class ResumeService {
    private final FilterBuilder fb;
    private final FilterParser filterParser;
    private final FilterSpecificationConverter filterSpecificationConverter;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public ResumeService(
            FilterBuilder fb,
            FilterParser filterParser,
            FilterSpecificationConverter filterSpecificationConverter,
            ResumeRepository resumeRepository,
            UserRepository userRepository,
            JobRepository jobRepository) {
        this.fb = fb;
        this.filterParser = filterParser;
        this.filterSpecificationConverter = filterSpecificationConverter;
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
    }

    public Optional<Resume> fetchById(long id) {
        return this.resumeRepository.findById(id);
    }

    public boolean checkResumeExistByUserAndJob(Resume resume) {
        if (resume.getUser() == null) return false;
        if (userRepository.findById(resume.getUser().getId()).isEmpty()) return false;

        if (resume.getJob() == null) return false;
        if (jobRepository.findById(resume.getJob().getId()).isEmpty()) return false;

        return true;
    }

    // ✅ Create với kiểm tra quyền
    public ResCreateResumeDTO create(Resume resume) {
        User currentUser = userRepository.findByEmail(SecurityUtil.getCurrentUserLogin().orElseThrow());

        if ("HR".equals(currentUser.getRole().getName()) &&
                resume.getJob() != null &&
                resume.getJob().getCompany().getId() != currentUser.getCompany().getId()) {
            throw new AccessDeniedException("Bạn không có quyền tạo hồ sơ cho công ty khác");
        }

        resume = this.resumeRepository.save(resume);

        ResCreateResumeDTO res = new ResCreateResumeDTO();
        res.setId(resume.getId());
        res.setUrl(resume.getUrl());
        res.setCreatedBy(resume.getCreatedBy());
        res.setCreatedAt(resume.getCreatedAt());
        return res;
    }

    // ✅ Update với kiểm tra quyền
    public ResUpdateResumeDTO update(Resume resume) throws IdInvalidException {
        User currentUser = userRepository.findByEmail(SecurityUtil.getCurrentUserLogin().orElseThrow());

        Resume existing = resumeRepository.findById(resume.getId())
                .orElseThrow(() -> new IdInvalidException("Resume không tồn tại"));

        if ("HR".equals(currentUser.getRole().getName()) &&
                existing.getJob().getCompany().getId() != currentUser.getCompany().getId()) {
            throw new AccessDeniedException("Bạn không có quyền sửa hồ sơ này");
        }

        existing.setStatus(resume.getStatus());
        resumeRepository.save(existing);

        ResUpdateResumeDTO res = new ResUpdateResumeDTO();
        res.setUpdatedAt(existing.getUpdatedAt());
        res.setUpdatedBy(existing.getUpdatedBy());
        return res;
    }

    public boolean isDuplicate(Long userId, Long jobId) {
        return resumeRepository.existsByUser_IdAndJob_Id(userId, jobId);
    }

    // ✅ Delete với kiểm tra quyền
    public void delete(long id) throws IdInvalidException {
        User currentUser = userRepository.findByEmail(SecurityUtil.getCurrentUserLogin().orElseThrow());

        Resume existing = resumeRepository.findById(id)
                .orElseThrow(() -> new IdInvalidException("Resume không tồn tại"));

        if ("HR".equals(currentUser.getRole().getName()) &&
                existing.getJob().getCompany().getId() != currentUser.getCompany().getId()) {
            throw new AccessDeniedException("Bạn không có quyền xóa hồ sơ này");
        }

        this.resumeRepository.deleteById(id);
    }

    public ResFetchResumeDTO getResume(Resume resume) {
        ResFetchResumeDTO res = new ResFetchResumeDTO();
        res.setId(resume.getId());
        res.setEmail(resume.getEmail());
        res.setUrl(resume.getUrl());
        res.setStatus(resume.getStatus());
        res.setCreatedAt(resume.getCreatedAt());
        res.setCreatedBy(resume.getCreatedBy());
        res.setUpdatedAt(resume.getUpdatedAt());
        res.setUpdatedBy(resume.getUpdatedBy());

        if (resume.getJob() != null) {
            res.setCompanyName(resume.getJob().getCompany().getName());
        }

        res.setUser(new ResFetchResumeDTO.UserResume(resume.getUser().getId(), resume.getUser().getName()));
        res.setJob(new ResFetchResumeDTO.JobResume(resume.getJob().getId(), resume.getJob().getName()));

        return res;
    }

    // ✅ FetchAll với lọc khi adminView = true
    public ResultPaginationDTO fetchAllResume(Specification<Resume> spec, Pageable pageable, String adminView) {
        User currentUser = userRepository.findByEmail(SecurityUtil.getCurrentUserLogin().orElseThrow());

        if ("true".equalsIgnoreCase(adminView) && "HR".equals(currentUser.getRole().getName())) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("job").get("company").get("id"), currentUser.getCompany().getId())
            );
        }

        Page<Resume> pageResume = this.resumeRepository.findAll(spec, pageable);
        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();
        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(pageResume.getTotalPages());
        mt.setTotal(pageResume.getTotalElements());

        rs.setMeta(mt);

        List<ResFetchResumeDTO> listResume = pageResume.getContent().stream()
                .map(this::getResume)
                .collect(Collectors.toList());
        rs.setResult(listResume);

        return rs;
    }

    public ResultPaginationDTO fetchResumeByUser(Pageable pageable) {
        String email = SecurityUtil.getCurrentUserLogin().orElse("");
        FilterNode node = filterParser.parse("email='" + email + "'");
        FilterSpecification<Resume> spec = filterSpecificationConverter.convert(node);
        Page<Resume> pResume = this.resumeRepository.findAll(spec, pageable);

        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();
        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(pResume.getTotalPages());
        mt.setTotal(pResume.getNumberOfElements());

        rs.setMeta(mt);

        List<ResFetchResumeDTO> listResume = pResume.getContent().stream()
                .map(this::getResume)
                .collect(Collectors.toList());
        rs.setResult(listResume);

        return rs;
    }
}
