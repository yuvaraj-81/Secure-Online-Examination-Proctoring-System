package com.exam.online_exam_platform.controller;

import com.exam.online_exam_platform.dto.ExamSubmitRequest;
import com.exam.online_exam_platform.dto.QuestionReviewDTO;
import com.exam.online_exam_platform.dto.StudentExamDTO;
import com.exam.online_exam_platform.entity.Exam;
import com.exam.online_exam_platform.security.AuthUtil;
import com.exam.online_exam_platform.service.StudentExamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/student/exams")
public class StudentExamController {

    private final StudentExamService service;
    private final AuthUtil authUtil;

    public StudentExamController(
            StudentExamService service,
            AuthUtil authUtil
    ) {
        this.service = service;
        this.authUtil = authUtil;
    }

    /* ================= GET ALL EXAMS ================= */
    @GetMapping
    public List<StudentExamDTO> getMyExams() {
        return service.getAllExamsForStudent(authUtil.getCurrentUser());
    }

    /* ================= START / RESUME ================= */
    @GetMapping("/{id}/attempt")
    public Map<String, Object> startOrResume(@PathVariable Long id) {
        return service.startOrResume(id, authUtil.getCurrentUser());
    }

    /* ================= AUTOSAVE ================= */
    @PostMapping(
            value = "/{id}/autosave",
            consumes = "application/json"
    )
    public ResponseEntity<?> autosave(
            @PathVariable Long id,
            @RequestBody ExamSubmitRequest body
    ) {
        service.autosave(
                id,
                authUtil.getCurrentUser(),
                body.getAnswers() == null ? "{}" : body.getAnswers(),
                body.getViolations() == null ? 0 : body.getViolations()
        );

        return ResponseEntity.ok().build();
    }

    /* ================= SUBMIT ================= */
    @PostMapping(
            value = "/{id}/submit",
            consumes = "application/json"
    )
    public ResponseEntity<?> submit(
            @PathVariable Long id,
            @RequestBody ExamSubmitRequest body
    ) {
        service.submit(
                id,
                authUtil.getCurrentUser(),
                body.getAnswers() == null ? "{}" : body.getAnswers(),
                body.getViolations() == null ? 0 : body.getViolations(),
                body.getReason() == null ? "MANUAL_SUBMIT" : body.getReason()
        );

        return ResponseEntity.ok().build();
    }

}
