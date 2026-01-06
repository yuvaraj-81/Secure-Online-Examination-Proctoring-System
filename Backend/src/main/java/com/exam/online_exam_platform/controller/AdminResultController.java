package com.exam.online_exam_platform.controller;

import com.exam.online_exam_platform.dto.AdminResultDTO;
import com.exam.online_exam_platform.service.AdminResultService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/results")
public class AdminResultController {

    private final AdminResultService resultService;

    // ✅ Explicit constructor (Maven & Docker safe)
    public AdminResultController(AdminResultService resultService) {
        this.resultService = resultService;
    }

    @GetMapping
    public List<AdminResultDTO> getAllResults() {
        return resultService.getAllResults();
    }
}
