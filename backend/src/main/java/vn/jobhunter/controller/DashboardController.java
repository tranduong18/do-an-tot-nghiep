package vn.jobhunter.controller;

import org.springframework.web.bind.annotation.*;
import vn.jobhunter.domain.response.dashboard.DashboardSummaryDTO;
import vn.jobhunter.service.DashboardService;

@RestController
@RequestMapping("/api/v1/")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard/summary")
    public DashboardSummaryDTO summary(
            @RequestParam(defaultValue = "12") int months,
            @RequestParam(defaultValue = "10") int top,
            @RequestParam(defaultValue = "30") int daysForPeak
    ) {
        return dashboardService.getSummary(months, top, daysForPeak);
    }
}
