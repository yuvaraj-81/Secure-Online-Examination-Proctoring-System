package com.exam.online_exam_platform.controller;

import com.exam.online_exam_platform.dto.AdminDashboardOverviewDTO;
import com.exam.online_exam_platform.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    public AdminDashboardController(AdminDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/overview")
    public ResponseEntity<AdminDashboardOverviewDTO> getOverview() {
        AdminDashboardOverviewDTO overview = dashboardService.getOverview();
        return ResponseEntity.ok(overview);
    }
}
