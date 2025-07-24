package vn.jobhunter.service;

import org.springframework.stereotype.Service;
import vn.jobhunter.domain.response.dashboard.ResTopCompanyDTO;
import vn.jobhunter.domain.response.dashboard.ResUserMonthlyDTO;
import vn.jobhunter.repository.CompanyRepository;
import vn.jobhunter.repository.JobRepository;
import vn.jobhunter.repository.ResumeRepository;
import vn.jobhunter.repository.UserRepository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;

    public DashboardService(
            UserRepository userRepository,
            CompanyRepository companyRepository,
            JobRepository jobRepository,
            ResumeRepository resumeRepository
    ) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.resumeRepository = resumeRepository;
    }

    public Map<String, Long> getSystemStats() {
        return Map.of(
                "users", userRepository.count(),
                "companies", companyRepository.count(),
                "jobs", jobRepository.count(),
                "resumes", resumeRepository.count()
        );
    }

    public List<ResUserMonthlyDTO> getUserMonthlyStats() {
        List<ResUserMonthlyDTO> result = new ArrayList<>();
        YearMonth now = YearMonth.now();

        for (int i = 5; i >= 0; i--) {
            YearMonth target = now.minusMonths(i);
            LocalDateTime startLocal = target.atDay(1).atStartOfDay();
            LocalDateTime endLocal = target.atEndOfMonth().atTime(23, 59, 59);

            Instant start = startLocal.atZone(ZoneId.systemDefault()).toInstant();
            Instant end = endLocal.atZone(ZoneId.systemDefault()).toInstant();

            long count = userRepository.countByCreatedAtBetween(start, end);
            result.add(new ResUserMonthlyDTO("Tháng " + target.getMonthValue(), count));
        }

        return result;
    }

    public List<ResTopCompanyDTO> getTopCompanies() {
        return companyRepository.findTopCompaniesByJobCount();
    }
}
