package vn.jobhunter.service;

import java.text.Normalizer;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.jobhunter.domain.Job;
import vn.jobhunter.domain.Skill;
import vn.jobhunter.domain.Subscriber;
import vn.jobhunter.domain.response.email.ResEmailJob;
import vn.jobhunter.repository.JobRepository;
import vn.jobhunter.repository.SkillRepository;
import vn.jobhunter.repository.SubscriberRepository;

@Service
public class SubscriberService {
    private final SubscriberRepository subscriberRepository;
    private final SkillRepository skillRepository;
    private final JobRepository jobRepository;
    private final EmailService emailService;

    @Value("${frontend-url}")
    private String frontendUrl;

    public SubscriberService(
            SubscriberRepository subscriberRepository,
            SkillRepository skillRepository,
            JobRepository jobRepository,
            EmailService emailService) {
        this.subscriberRepository = subscriberRepository;
        this.skillRepository = skillRepository;
        this.jobRepository = jobRepository;
        this.emailService = emailService;
    }

    private String toSlug(String input) {
        String n = Normalizer.normalize(input == null ? "" : input, Normalizer.Form.NFD);
        String noAccent = n.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String slug = noAccent.toLowerCase().replaceAll("[^a-z0-9\\s-]", "").trim().replaceAll("\\s+", "-");
        return slug;
    }

    public boolean isExistsByEmail(String email) {
        return this.subscriberRepository.existsByEmail(email);
    }

    public Subscriber create(Subscriber subs) {
        if (subs.getSkills() != null) {
            List<Long> reqSkills = subs.getSkills().stream().map(Skill::getId).collect(Collectors.toList());
            List<Skill> dbSkills = this.skillRepository.findByIdIn(reqSkills);
            subs.setSkills(dbSkills);
        }
        Subscriber saved = this.subscriberRepository.save(subs);

        this.sendEmailJobsForSubscriber(saved);

        return saved;
    }

    public Subscriber update(Subscriber subsDB, Subscriber subsRequest) {
        if (subsRequest.getSkills() != null) {
            List<Long> reqSkills = subsRequest.getSkills().stream().map(Skill::getId).collect(Collectors.toList());
            List<Skill> dbSkills = this.skillRepository.findByIdIn(reqSkills);
            subsDB.setSkills(dbSkills);
        }
        Subscriber saved = this.subscriberRepository.save(subsDB);
        this.sendEmailJobsForSubscriber(saved);

        return saved;
    }

    public Subscriber findById(long id) {
        Optional<Subscriber> subsOptional = this.subscriberRepository.findById(id);
        return subsOptional.orElse(null);
    }

    public ResEmailJob convertJobToSendEmail(Job job) {
        ResEmailJob res = new ResEmailJob();
        res.setId(job.getId());
        res.setName(job.getName());
        res.setSalary(job.getSalary());
        res.setCompany(new ResEmailJob.CompanyEmail(job.getCompany().getName()));
        res.setSkills(job.getSkills().stream()
                .map(s -> new ResEmailJob.SkillEmail(s.getName()))
                .toList());

        String slug = toSlug(job.getName());
        res.setUrl(frontendUrl + "/job/" + slug + "?id=" + job.getId());
        return res;
    }

    @Transactional(readOnly = true)
    public void sendEmailJobsForSubscriber(Subscriber sub) {
        if (sub == null) return;
        List<Skill> listSkills = sub.getSkills();
        if (listSkills == null || listSkills.isEmpty()) return;

        List<Job> listJobs = this.jobRepository.findBySkillsIn(listSkills);
        if (listJobs == null || listJobs.isEmpty()) return;

        List<ResEmailJob> arr = listJobs.stream()
                .distinct() // tránh trùng job nếu match nhiều skill
                .map(this::convertJobToSendEmail)
                .collect(Collectors.toList());

        // NOTE: hàm này đã @Async nên không chặn request
        this.emailService.sendEmailFromTemplateSync(
                sub.getEmail(),
                "Cơ hội việc làm hot đang chờ đợi bạn, khám phá ngay",
                "job",
                sub.getName(),
                arr
        );
    }

    public Subscriber findByEmail(String email) {
        return this.subscriberRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public void sendSubscribersEmailJobs() {
        List<Subscriber> listSubs = this.subscriberRepository.findAll();
        if (listSubs == null || listSubs.isEmpty()) return;

        for (Subscriber sub : listSubs) {
            sendEmailJobsForSubscriber(sub);
        }
    }
}
