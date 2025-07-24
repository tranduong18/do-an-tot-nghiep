package vn.jobhunter.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import vn.jobhunter.domain.response.dashboard.ResTopCompanyDTO;
import vn.jobhunter.domain.response.dashboard.ResUserMonthlyDTO;
import vn.jobhunter.repository.*;
import vn.jobhunter.service.DashboardService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        return dashboardService.getSystemStats();
    }

    @GetMapping("/user-monthly")
    public List<ResUserMonthlyDTO> getUserMonthly() {
        return dashboardService.getUserMonthlyStats();
    }

    @GetMapping("/top-companies")
    public List<ResTopCompanyDTO> getTopCompanies() {
        return dashboardService.getTopCompanies();
    }
}
