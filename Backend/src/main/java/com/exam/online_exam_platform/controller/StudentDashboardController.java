package com.exam.online_exam_platform.controller;

import com.exam.online_exam_platform.dto.StudentDashboardDTO;
import com.exam.online_exam_platform.security.AuthUtil;
import com.exam.online_exam_platform.service.StudentExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/student/dashboard")
@RequiredArgsConstructor
public class StudentDashboardController {

    private final StudentExamService studentExamService;
    private final AuthUtil authUtil;

    @GetMapping("/summary")
    public StudentDashboardDTO getDashboardSummary() {
        return studentExamService.getStudentDashboard(
                authUtil.getCurrentUser()
        );
    }
}
