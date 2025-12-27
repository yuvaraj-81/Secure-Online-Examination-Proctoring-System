package com.exam.online_exam_platform.controller;

import com.exam.online_exam_platform.dto.QuestionReviewDTO;
import com.exam.online_exam_platform.dto.StudentResultDTO;
import com.exam.online_exam_platform.entity.Result;
import com.exam.online_exam_platform.repository.ResultRepository;
import com.exam.online_exam_platform.security.AuthUtil;
import com.exam.online_exam_platform.service.StudentExamService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/student/results")
public class StudentResultController {

    private final ResultRepository repo;
    private final StudentExamService studentExamService;
    private final AuthUtil authUtil;

    public StudentResultController(
            ResultRepository repo,
            StudentExamService studentExamService,
            AuthUtil authUtil
    ) {
        this.repo = repo;
        this.studentExamService = studentExamService;
        this.authUtil = authUtil;
    }

    /* ================= GET MY RESULTS ================= */
    @GetMapping
    public List<StudentResultDTO> myResults() {
        return studentExamService.getStudentResults(
                authUtil.getCurrentUser()
        );
    }

    /* ================= RESULTS SUMMARY ================= */
    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        return studentExamService.getResultSummary(
                authUtil.getCurrentUser()
        );
    }


    /* ================= REVIEW RESULT ================= */
    @GetMapping("/{resultId}/review")
    public List<QuestionReviewDTO> getResultReview(
            @PathVariable Long resultId
    ) {
        return studentExamService.getResultReview(
                resultId,
                authUtil.getCurrentUser()
        );
    }
}
