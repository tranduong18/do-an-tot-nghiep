package vn.jobhunter.domain.response.dashboard;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SummaryChartsDTO {
    private List<ResLabelCountDTO> jobsMonthly;                 // 12 tháng
    private List<ResLabelCountDTO> jobSpecializationRatio;      // donut
    private List<ResLabelCountDTO> resumePeakHour;              // 0..23h
    private List<ResLabelCountDTO> topCompaniesThisMonth;       // top N
    private List<ResLabelCountDTO> resumesBySpecializationYear; // bar
}
