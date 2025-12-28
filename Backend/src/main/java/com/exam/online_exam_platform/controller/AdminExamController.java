package com.exam.online_exam_platform.controller;

import com.exam.online_exam_platform.dto.QuestionCreateDTO;
import com.exam.online_exam_platform.entity.Exam;
import com.exam.online_exam_platform.entity.Question;
import com.exam.online_exam_platform.service.AdminExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/admin/exams")
@RequiredArgsConstructor
public class AdminExamController {

    private final AdminExamService examService;

    /* ================= EXAMS ================= */

    @GetMapping
    public List<Exam> getAllExams() {
        return examService.getAllExams();
    }

    @PostMapping
    public void createExam(@RequestBody Exam exam) {
        examService.createExam(exam);
    }

    @DeleteMapping("/{examId}")
    public ResponseEntity<?> deleteExam(@PathVariable Long examId) {
        try {
            examService.deleteExam(examId);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /* ================= QUESTIONS ================= */

    @GetMapping("/{examId}/questions")
    public List<Question> getQuestionsByExam(@PathVariable Long examId) {
        return examService.getQuestionsByExam(examId);
    }

    @PostMapping("/{examId}/questions")
    public void addQuestion(
            @PathVariable Long examId,
            @RequestBody QuestionCreateDTO dto
    ) {
        examService.addQuestionToExam(examId, dto);
    }

    @PostMapping("/{examId}/questions/import-pdf")
    public ResponseEntity<?> importQuestionsFromPdf(
            @PathVariable Long examId,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            int count = examService.importQuestionsFromPdf(examId, file);
            return ResponseEntity.ok("Imported " + count + " questions successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
