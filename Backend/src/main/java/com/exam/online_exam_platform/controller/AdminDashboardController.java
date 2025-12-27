package com.exam.online_exam_platform.controller;

import com.exam.online_exam_platform.dto.AdminDashboardOverviewDTO;
import com.exam.online_exam_platform.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping("/overview")
    public AdminDashboardOverviewDTO getOverview() {
        return dashboardService.getOverview();
    }
}
