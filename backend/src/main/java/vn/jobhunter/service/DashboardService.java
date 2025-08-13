package vn.jobhunter.service;

import org.springframework.stereotype.Service;
import vn.jobhunter.domain.response.dashboard.*;
import vn.jobhunter.repository.*;

import java.time.*;
import java.util.*;

@Service
public class DashboardService {
    private final UserRepository userRepo;
    private final CompanyRepository companyRepo;
    private final JobRepository jobRepo;
    private final ResumeRepository resumeRepo;

    public DashboardService(UserRepository userRepo, CompanyRepository companyRepo,
                            JobRepository jobRepo, ResumeRepository resumeRepo) {
        this.userRepo = userRepo;
        this.companyRepo = companyRepo;
        this.jobRepo = jobRepo;
        this.resumeRepo = resumeRepo;
    }

    public DashboardSummaryDTO getSummary(int months, int top, int daysForPeak) {
        if (months <= 0) months = 12;
        if (top <= 0) top = 10;
        if (daysForPeak <= 0) daysForPeak = 30;

        ZoneId zone = ZoneId.systemDefault();
        Instant now = Instant.now();

        // --- Cards ---
        // jobsActive
        long jobsActive = jobRepo.countActive(now);
        // companies/users tổng
        long companies = companyRepo.count();
        long users = userRepo.count();
        // resumesThisMonth
        YearMonth ymNow = YearMonth.now();
        Instant mStart = ymNow.atDay(1).atStartOfDay(zone).toInstant();
        Instant mEnd = ymNow.atEndOfMonth().atTime(23,59,59).atZone(zone).toInstant();
        long resumesThisMonth = resumeRepo.countCreatedBetween(mStart, mEnd);
        long hrUsers = userRepo.countByRoleName("HR");

        // tăng trưởng 30 ngày + active 24h
        Instant d30 = now.minusSeconds(30L * 24 * 3600);
        long usersNew30d = userRepo.countByCreatedAtBetween(d30, now);
        long companiesNew30d = companyRepo.countByCreatedAtBetween(d30, now);
        long jobsNew30d = jobRepo.countCreatedBetween(d30, now);
        long activeUsers24h = userRepo.countByUpdatedAtBetween(now.minusSeconds(24L * 3600), now);

        SummaryCardsDTO cards = SummaryCardsDTO.builder()
                .jobsActive(jobsActive)
                .companies(companies)
                .resumesThisMonth(resumesThisMonth)
                .users(users)
                .usersNew30d(usersNew30d)
                .companiesNew30d(companiesNew30d)
                .jobsNew30d(jobsNew30d)
                .activeUsers24h(activeUsers24h)
                .hrUsers(hrUsers)
                .build();

        // --- Charts ---
        List<ResLabelCountDTO> jobsMonthly = buildJobsMonthly(months, zone);
        List<ResLabelCountDTO> jobSpecRatio = mapPairs(jobRepo.specializationCountsActive(now), Integer.MAX_VALUE);
        List<ResLabelCountDTO> peakHour = buildResumePeakHour(daysForPeak, zone);
        List<ResLabelCountDTO> topCompaniesThisMonth = mapPairs(
                jobRepo.topCompaniesThisMonth(mStart, mEnd), top);
        List<ResLabelCountDTO> resumesBySpecYear = buildResumeBySpecInYear(zone);

        SummaryChartsDTO charts = SummaryChartsDTO.builder()
                .jobsMonthly(jobsMonthly)
                .jobSpecializationRatio(jobSpecRatio)
                .resumePeakHour(peakHour)
                .topCompaniesThisMonth(topCompaniesThisMonth)
                .resumesBySpecializationYear(resumesBySpecYear)
                .build();

        return DashboardSummaryDTO.builder()
                .cards(cards)
                .charts(charts)
                .build();
    }

    // ==== helpers ====

    private List<ResLabelCountDTO> buildJobsMonthly(int months, ZoneId zone) {
        List<ResLabelCountDTO> list = new ArrayList<>();
        YearMonth cur = YearMonth.now();
        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = cur.minusMonths(i);
            Instant start = ym.atDay(1).atStartOfDay(zone).toInstant();
            Instant end = ym.atEndOfMonth().atTime(23,59,59).atZone(zone).toInstant();
            long c = jobRepo.countCreatedBetween(start, end);
            list.add(new ResLabelCountDTO(ym.getYear() + "-" + String.format("%02d", ym.getMonthValue()), c));
        }
        return list;
    }

    private List<ResLabelCountDTO> buildResumePeakHour(int daysForPeak, ZoneId zone) {
        Instant end = Instant.now();
        Instant start = end.minusSeconds(daysForPeak * 24L * 3600);
        long[] buckets = new long[24];
        for (Instant t : resumeRepo.findCreatedAtBetween(start, end)) {
            int h = LocalDateTime.ofInstant(t, zone).getHour();
            buckets[h]++;
        }
        List<ResLabelCountDTO> out = new ArrayList<>(24);
        for (int h = 0; h < 24; h++) {
            out.add(new ResLabelCountDTO(String.format("%02dh", h), buckets[h]));
        }
        return out;
    }

    private List<ResLabelCountDTO> buildResumeBySpecInYear(ZoneId zone) {
        LocalDate nowDate = LocalDate.now();
        Instant yStart = LocalDate.of(nowDate.getYear(), 1, 1).atStartOfDay(zone).toInstant();
        Instant yEnd = LocalDate.of(nowDate.getYear(), 12, 31).atTime(23,59,59).atZone(zone).toInstant();
        return mapPairs(resumeRepo.countResumesBySpecializationBetween(yStart, yEnd), Integer.MAX_VALUE);
    }

    private List<ResLabelCountDTO> mapPairs(List<Object[]> rows, int limit) {
        List<ResLabelCountDTO> out = new ArrayList<>();
        int n = Math.min(limit, rows.size());
        for (int i = 0; i < n; i++) {
            Object[] r = rows.get(i);
            String label = (r[0] == null || String.valueOf(r[0]).isBlank()) ? "Khác" : String.valueOf(r[0]);
            long count = (r[1] == null) ? 0L : ((Number) r[1]).longValue();
            out.add(new ResLabelCountDTO(label, count));
        }
        return out;
    }
}
