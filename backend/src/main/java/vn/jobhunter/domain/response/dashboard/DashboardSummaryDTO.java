package vn.jobhunter.domain.response.dashboard;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardSummaryDTO {
    private SummaryCardsDTO cards;
    private SummaryChartsDTO charts;
}
