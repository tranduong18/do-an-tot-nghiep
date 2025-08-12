package vn.jobhunter.service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
import vn.jobhunter.domain.request.ReqUpdateResumeStatus;
import vn.jobhunter.domain.response.ResultPaginationDTO;
import vn.jobhunter.domain.response.resume.ResCreateResumeDTO;
import vn.jobhunter.domain.response.resume.ResFetchResumeDTO;
import vn.jobhunter.domain.response.resume.ResUpdateResumeDTO;
import vn.jobhunter.repository.JobRepository;
import vn.jobhunter.repository.ResumeRepository;
import vn.jobhunter.repository.UserRepository;
import vn.jobhunter.util.SecurityUtil;
import vn.jobhunter.util.constant.ResumeStateEnum;
import vn.jobhunter.util.error.IdInvalidException;

@Service
public class ResumeService {
    private final FilterBuilder fb;
    private final FilterParser filterParser;
    private final FilterSpecificationConverter filterSpecificationConverter;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final SseService sseService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public ResumeService(
            FilterBuilder fb,
            FilterParser filterParser,
            FilterSpecificationConverter filterSpecificationConverter,
            ResumeRepository resumeRepository,
            UserRepository userRepository,
            JobRepository jobRepository,
            SseService sseService,
            NotificationService notificationService, EmailService emailService) {
        this.fb = fb;
        this.filterParser = filterParser;
        this.filterSpecificationConverter = filterSpecificationConverter;
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.sseService = sseService;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    private String formatVN(Instant instant) {
        if (instant == null) return null;
        ZonedDateTime vn = instant.atZone(ZoneId.of("Asia/Ho_Chi_Minh"));
        return vn.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
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

    public ResUpdateResumeDTO updateStatus(ReqUpdateResumeStatus req) throws IdInvalidException {
        User currentUser = userRepository.findByEmail(SecurityUtil.getCurrentUserLogin().orElseThrow());

        Resume existing = resumeRepository.findById(req.getId())
                .orElseThrow(() -> new IdInvalidException("Resume không tồn tại"));

        if ("HR".equals(currentUser.getRole().getName()) &&
                existing.getJob().getCompany().getId() != currentUser.getCompany().getId()) {
            throw new AccessDeniedException("Bạn không có quyền sửa hồ sơ này");
        }

        ResumeStateEnum oldStatus = existing.getStatus();
        existing.setStatus(req.getStatus());

        // Map dữ liệu theo trạng thái
        if (req.getStatus() == ResumeStateEnum.APPROVED) {
            Instant ivAt = null;
            if (req.getInterviewAt() != null && !req.getInterviewAt().isBlank()) {
                try { ivAt = Instant.parse(req.getInterviewAt()); } catch (Exception ignored) {}
            }
            existing.setInterviewAt(ivAt);
            existing.setInterviewLocation(req.getInterviewLocation());
            existing.setInterviewNote(req.getInterviewNote());
            existing.setRejectReason(null);
        } else if (req.getStatus() == ResumeStateEnum.REJECTED) {
            existing.setRejectReason(req.getRejectReason());
            existing.setInterviewAt(null);
            existing.setInterviewLocation(null);
            existing.setInterviewNote(null);
        } else {
            // REVIEWING/PENDING: clear các field phụ
            existing.setInterviewAt(null);
            existing.setInterviewLocation(null);
            existing.setInterviewNote(null);
            existing.setRejectReason(null);
        }

        resumeRepository.save(existing);

        if (oldStatus != existing.getStatus()) {
            String jobName = existing.getJob() != null ? existing.getJob().getName() : "";
            String companyName = (existing.getJob() != null && existing.getJob().getCompany() != null)
                    ? existing.getJob().getCompany().getName() : "";
            String candidateName = existing.getUser() != null ? existing.getUser().getName() : "";

            String statusVn = switch (existing.getStatus().name()) {
                case "APPROVED" -> "ĐÃ PHÊ DUYỆT";
                case "REJECTED" -> "BỊ TỪ CHỐI";
                case "REVIEWING" -> "ĐANG XEM XÉT";
                default -> "CHỜ DUYỆT";
            };

            // -------- 1) Notification (text thuần) ----------
            StringBuilder contentPlain = new StringBuilder();
            contentPlain.append("Vị trí: ").append(jobName).append("\n");
            contentPlain.append("Công ty: ").append(companyName).append("\n");
            contentPlain.append("Trạng thái: ").append(statusVn).append("\n");

            if (existing.getStatus() == ResumeStateEnum.APPROVED) {
                String ivTime = formatVN(existing.getInterviewAt());
                if (ivTime != null) contentPlain.append("Thời gian phỏng vấn: ").append(ivTime).append("\n");
                if (existing.getInterviewLocation() != null && !existing.getInterviewLocation().isBlank())
                    contentPlain.append("Địa điểm/Link: ").append(existing.getInterviewLocation()).append("\n");
                if (existing.getInterviewNote() != null && !existing.getInterviewNote().isBlank())
                    contentPlain.append("Ghi chú: ").append(existing.getInterviewNote()).append("\n");
            } else if (existing.getStatus() == ResumeStateEnum.REJECTED) {
                if (existing.getRejectReason() != null && !existing.getRejectReason().isBlank())
                    contentPlain.append("Lý do: ").append(existing.getRejectReason()).append("\n");
            }

            String notiTitle = "Trạng thái hồ sơ ";
            notificationService.create(
                    existing.getUser(),
                    notiTitle,
                    contentPlain.toString(),
                    statusVn
            );

            // -------- 2) SSE (tránh null) ----------
            try {
                Map<String, Object> payload = new java.util.HashMap<>();
                payload.put("resumeId", existing.getId());
                payload.put("status", existing.getStatus().name());
                payload.put("statusText", statusVn);
                payload.put("job", jobName);
                payload.put("company", companyName);
                payload.put("createdAt", Instant.now().toString());

                if (existing.getInterviewAt() != null) payload.put("interviewAt", existing.getInterviewAt());
                if (existing.getInterviewLocation() != null && !existing.getInterviewLocation().isBlank())
                    payload.put("interviewLocation", existing.getInterviewLocation());
                if (existing.getInterviewNote() != null && !existing.getInterviewNote().isBlank())
                    payload.put("interviewNote", existing.getInterviewNote());
                if (existing.getRejectReason() != null && !existing.getRejectReason().isBlank())
                    payload.put("rejectReason", existing.getRejectReason());

                sseService.sendToUser(existing.getUser().getId(), payload);
            } catch (Exception e) {
                System.out.println("Send SSE failed " + e);
            }

            // -------- 3) Email (CHỈ gửi khi APPROVED/REJECTED) ----------
            try {
                if (existing.getStatus() == ResumeStateEnum.APPROVED
                        || existing.getStatus() == ResumeStateEnum.REJECTED) {
                    // subject thân thiện cho ứng viên
                    String subject = (existing.getStatus() == ResumeStateEnum.APPROVED)
                            ? "[JobHunter] Chấp nhận hồ sơ - " + jobName
                            : "[JobHunter] Kết quả hồ sơ - " + jobName;

                    var model = new java.util.HashMap<String, Object>();
                    model.put("name", candidateName);
                    model.put("status", existing.getStatus().name());
                    model.put("jobName", jobName);
                    model.put("companyName", companyName);
                    model.put("interviewAt", formatVN(existing.getInterviewAt()));
                    model.put("interviewLocation", existing.getInterviewLocation());
                    model.put("interviewNote", existing.getInterviewNote());
                    model.put("rejectReason", existing.getRejectReason());

                    emailService.sendResumeStatusTemplate(existing.getEmail(), subject, model);
                }
            } catch (Exception e) {
                System.out.println("Send email failed " + e);
            }
        }

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
