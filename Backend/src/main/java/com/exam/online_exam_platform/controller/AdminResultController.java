package com.exam.online_exam_platform.controller;

import com.exam.online_exam_platform.dto.AdminResultDTO;
import com.exam.online_exam_platform.service.AdminResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/results")
@RequiredArgsConstructor
public class AdminResultController {

    private final AdminResultService resultService;

    @GetMapping
    public List<AdminResultDTO> getAllResults() {
        return resultService.getAllResults();
    }
}
