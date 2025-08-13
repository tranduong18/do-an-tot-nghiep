package vn.jobhunter.domain.response.dashboard;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SummaryCardsDTO {
    private long jobsActive;
    private long companies;
    private long resumesThisMonth;
    private long users;

    private long usersNew30d;
    private long companiesNew30d;
    private long jobsNew30d;
    private long activeUsers24h;

    private long hrUsers;
}
