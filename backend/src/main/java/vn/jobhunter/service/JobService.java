package vn.jobhunter.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

import vn.jobhunter.domain.Company;
import vn.jobhunter.domain.Job;
import vn.jobhunter.domain.Skill;
import vn.jobhunter.domain.User;
import vn.jobhunter.domain.response.ResultPaginationDTO;
import vn.jobhunter.domain.response.job.ResCompanyJobDTO;
import vn.jobhunter.domain.response.job.ResCreateJobDTO;
import vn.jobhunter.domain.response.job.ResSimilarJobDTO;
import vn.jobhunter.domain.response.job.ResUpdateJobDTO;
import vn.jobhunter.repository.*;
import vn.jobhunter.util.SecurityUtil;
import vn.jobhunter.util.error.IdInvalidException;

@Service
public class JobService {
    private final JobRepository jobRepository;
    private final SkillRepository skillRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final FavoriteJobRepository favoriteJobRepository;
    private final ResumeRepository resumeRepository;

    public JobService(JobRepository jobRepository, SkillRepository skillRepository,
                      CompanyRepository companyRepository, UserRepository userRepository, FavoriteJobRepository favoriteJobRepository, ResumeRepository resumeRepository) {
        this.jobRepository = jobRepository;
        this.skillRepository = skillRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.favoriteJobRepository = favoriteJobRepository;
        this.resumeRepository = resumeRepository;
    }

    public Optional<Job> fetchJobById(long id) {
        return this.jobRepository.findById(id);
    }

    public ResCreateJobDTO create(Job j) {
        User currentUser = userRepository.findByEmail(SecurityUtil.getCurrentUserLogin().orElseThrow());

        if ("HR".equals(currentUser.getRole().getName()) &&
                j.getCompany() != null &&
                j.getCompany().getId() != currentUser.getCompany().getId()) {
            throw new AccessDeniedException("Bạn không có quyền tạo job cho công ty khác");
        }
        // check skills
        if (j.getSkills() != null) {
            List<Long> reqSkills = j.getSkills().stream().map(x -> x.getId()).collect(Collectors.toList());

            List<Skill> dbSkills = this.skillRepository.findByIdIn(reqSkills);
            j.setSkills(dbSkills);
        }

        // check company
        if (j.getCompany() != null) {
            Optional<Company> companyOptional = this.companyRepository.findById(j.getCompany().getId());
            if (companyOptional.isPresent()) {
                j.setCompany(companyOptional.get());
            }
        }

        // create job
        Job currentJob = this.jobRepository.save(j);

        // convert response
        ResCreateJobDTO dto = new ResCreateJobDTO();
        dto.setId(currentJob.getId());
        dto.setName(currentJob.getName());
        dto.setSalary(currentJob.getSalary());
        dto.setQuantity(currentJob.getQuantity());
        dto.setLocation(currentJob.getLocation());
        dto.setLevel(currentJob.getLevel());
        dto.setStartDate(currentJob.getStartDate());
        dto.setEndDate(currentJob.getEndDate());
        dto.setActive(currentJob.isActive());
        dto.setCreatedAt(currentJob.getCreatedAt());
        dto.setCreatedBy(currentJob.getCreatedBy());
        dto.setSpecialization(currentJob.getSpecialization());
        dto.setFields(currentJob.getFields());
        dto.setAddress(currentJob.getAddress());
        dto.setWorkType(currentJob.getWorkType());

        if (currentJob.getSkills() != null) {
            List<String> skills = currentJob.getSkills().stream().map(item -> item.getName())
                    .collect(Collectors.toList());
            dto.setSkills(skills);
        }

        return dto;
    }

    public ResUpdateJobDTO update(Job j, Job jobInDB) {
        User currentUser = userRepository.findByEmail(SecurityUtil.getCurrentUserLogin().orElseThrow());

        if ("HR".equals(currentUser.getRole().getName()) &&
                jobInDB.getCompany().getId() != currentUser.getCompany().getId()) {
            throw new AccessDeniedException("Bạn không có quyền sửa job này");
        }
        // check skills
        if (j.getSkills() != null) {
            List<Long> reqSkills = j.getSkills().stream().map(x -> x.getId()).collect(Collectors.toList());
            List<Skill> dbSkills = this.skillRepository.findByIdIn(reqSkills);
            jobInDB.setSkills(dbSkills);
        }

        // check company
        if (j.getCompany() != null) {
            Optional<Company> cOptional = this.companyRepository.findById(j.getCompany().getId());
            if (cOptional.isPresent()) {
                jobInDB.setCompany(cOptional.get());
            }
        }

        // update correct info
        jobInDB.setName(j.getName());
        jobInDB.setSalary(j.getSalary());
        jobInDB.setQuantity(j.getQuantity());
        jobInDB.setLocation(j.getLocation());
        jobInDB.setLevel(j.getLevel());
        jobInDB.setStartDate(j.getStartDate());
        jobInDB.setEndDate(j.getEndDate());
        jobInDB.setActive(j.isActive());
        jobInDB.setSpecialization(j.getSpecialization());
        jobInDB.setFields(j.getFields());
        jobInDB.setAddress(j.getAddress());
        jobInDB.setWorkType(j.getWorkType());
        jobInDB.setDescription(j.getDescription());

        // update job
        Job currentJob = this.jobRepository.save(jobInDB);

        // convert response
        ResUpdateJobDTO dto = new ResUpdateJobDTO();
        dto.setId(currentJob.getId());
        dto.setName(currentJob.getName());
        dto.setSalary(currentJob.getSalary());
        dto.setQuantity(currentJob.getQuantity());
        dto.setLocation(currentJob.getLocation());
        dto.setLevel(currentJob.getLevel());
        dto.setStartDate(currentJob.getStartDate());
        dto.setEndDate(currentJob.getEndDate());
        dto.setActive(currentJob.isActive());
        dto.setSpecialization(currentJob.getSpecialization());
        dto.setFields(currentJob.getFields());
        dto.setAddress(currentJob.getAddress());
        dto.setWorkType(currentJob.getWorkType());
        dto.setUpdatedAt(currentJob.getUpdatedAt());
        dto.setUpdatedBy(currentJob.getUpdatedBy());

        if (currentJob.getSkills() != null) {
            List<String> skills = currentJob.getSkills().stream().map(item -> item.getName())
                    .collect(Collectors.toList());
            dto.setSkills(skills);
        }

        return dto;
    }

    public void delete(long id) throws IdInvalidException {
        User currentUser = userRepository.findByEmail(SecurityUtil.getCurrentUserLogin().orElseThrow());
        Job existing = jobRepository.findById(id)
                .orElseThrow(() -> new IdInvalidException("Job không tồn tại"));

        if ("HR".equals(currentUser.getRole().getName()) &&
                existing.getCompany().getId() != currentUser.getCompany().getId()) {
            throw new AccessDeniedException("Bạn không có quyền xóa job này");
        }
        favoriteJobRepository.deleteByJob(existing);
        resumeRepository.deleteByJob(existing);
        this.jobRepository.deleteById(id);
    }

    public ResultPaginationDTO fetchAll(Specification<Job> spec, Pageable pageable, String adminView) {
        User currentUser = userRepository.findByEmail(SecurityUtil.getCurrentUserLogin().orElseThrow());

        if ("true".equalsIgnoreCase(adminView) && "HR".equals(currentUser.getRole().getName())) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("company").get("id"), currentUser.getCompany().getId())
            );
        }

        Page<Job> pageJob = this.jobRepository.findAll(spec, pageable);

        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();

        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());

        mt.setPages(pageJob.getTotalPages());
        mt.setTotal(pageJob.getTotalElements());

        rs.setMeta(mt);
        rs.setResult(pageJob.getContent());

        return rs;
    }

    public ResultPaginationDTO searchJobs(String q, List<String> skills, List<String> locations, Pageable pageable) {
        Specification<Job> spec = Specification.where(null);

        // Lọc theo keyword (job name hoặc company name)
        if (q != null && !q.isBlank()) {
            String keyword = q.toLowerCase();
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), "%" + keyword + "%"),
                    cb.like(cb.lower(root.get("company").get("name")), "%" + keyword + "%")
            ));
        }

        // Lọc theo skills (ID hoặc tên)
        if (skills != null && !skills.isEmpty()) {
            List<String> normalized = skills.stream().map(String::toLowerCase).toList();

            spec = spec.and((root, query, cb) -> {
                Join<Object, Object> joinSkill = root.join("skills", JoinType.LEFT);
                Expression<String> skillName = cb.lower(joinSkill.get("name"));
                Expression<String> skillId = joinSkill.get("id").as(String.class);

                // Cho phép match nếu tên hoặc id nằm trong danh sách
                return cb.or(skillName.in(normalized), skillId.in(normalized));
            });
        }

        // Lọc theo location
        if (locations != null && !locations.isEmpty()) {
            spec = spec.and((root, query, cb) -> root.get("location").in(locations));
        }

        Page<Job> pageJob = jobRepository.findAll(spec, pageable);

        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();
        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(pageJob.getTotalPages());
        mt.setTotal(pageJob.getTotalElements());

        rs.setMeta(mt);
        rs.setResult(pageJob.getContent());
        return rs;
    }

    // ✅ API suggestions cho autocomplete (trả job + company)
    public List<Map<String, Object>> getSuggestions(String q) {
        List<Map<String, Object>> result = new ArrayList<>();

        jobRepository.findTop5ByNameContainingIgnoreCase(q)
                .forEach(j -> result.add(Map.of(
                        "type", "job",
                        "id", j.getId(),
                        "name", j.getName(),   // để frontend convert slug
                        "value", j.getName()
                )));

        companyRepository.findTop5ByNameContainingIgnoreCase(q)
                .forEach(c -> result.add(Map.of(
                        "type", "company",
                        "id", c.getId(),
                        "name", c.getName(),   // để frontend convert slug
                        "value", c.getName()
                )));

        return result;
    }

    public List<ResSimilarJobDTO> findSimilarJobs(long jobId) throws IdInvalidException {
        Job currentJob = jobRepository.findById(jobId)
                .orElseThrow(() -> new IdInvalidException("Job not found"));

        List<Long> skillIds = currentJob.getSkills().stream()
                .map(Skill::getId)
                .toList();

        Pageable limit = PageRequest.of(0, 8); // ✅ Giới hạn 8 job

        List<Job> jobs = jobRepository.findSimilarJobs(skillIds, currentJob.getLocation(), jobId, limit);

        return jobs.stream().map(job -> {
            ResSimilarJobDTO dto = new ResSimilarJobDTO();
            dto.setId(job.getId());
            dto.setName(job.getName());
            dto.setLocation(job.getLocation());
            dto.setSalary(job.getSalary());
            dto.setSpecialization(job.getSpecialization());
            dto.setWorkType(job.getWorkType());
            dto.setCreatedAt(job.getCreatedAt());
            dto.setUpdatedAt(job.getUpdatedAt());

            // Company
            if (job.getCompany() != null) {
                ResSimilarJobDTO.CompanyDTO companyDTO = new ResSimilarJobDTO.CompanyDTO();
                companyDTO.setId(job.getCompany().getId());
                companyDTO.setName(job.getCompany().getName());
                companyDTO.setLogo(job.getCompany().getLogo());
                dto.setCompany(companyDTO);
            }

            // Skills
            if (job.getSkills() != null) {
                List<ResSimilarJobDTO.SkillDTO> skillList = job.getSkills().stream().map(skill -> {
                    ResSimilarJobDTO.SkillDTO s = new ResSimilarJobDTO.SkillDTO();
                    s.setId(skill.getId());
                    s.setName(skill.getName());
                    return s;
                }).toList();
                dto.setSkills(skillList);
            }

            return dto;
        }).toList();
    }


    public List<ResCompanyJobDTO> findJobsByCompanyAsDTO(long companyId) {
        List<Job> jobs = jobRepository.findByCompanyId(companyId);

        return jobs.stream().map(job -> {
            ResCompanyJobDTO dto = new ResCompanyJobDTO();
            dto.setId(job.getId());
            dto.setName(job.getName());
            dto.setLocation(job.getLocation());
            dto.setSalary(job.getSalary());
            dto.setSpecialization(job.getSpecialization());
            dto.setWorkType(job.getWorkType());
            dto.setCreatedAt(job.getCreatedAt());
            dto.setUpdatedAt(job.getUpdatedAt());

            if (job.getCompany() != null) {
                ResCompanyJobDTO.CompanyDTO c = new ResCompanyJobDTO.CompanyDTO();
                c.setId(job.getCompany().getId());
                c.setName(job.getCompany().getName());
                c.setLogo(job.getCompany().getLogo());
                dto.setCompany(c);
            }

            if (job.getSkills() != null) {
                List<ResCompanyJobDTO.SkillDTO> skills = job.getSkills().stream().map(s -> {
                    ResCompanyJobDTO.SkillDTO sd = new ResCompanyJobDTO.SkillDTO();
                    sd.setId(s.getId());
                    sd.setName(s.getName());
                    return sd;
                }).toList();
                dto.setSkills(skills);
            }

            return dto;
        }).toList();
    }

}
