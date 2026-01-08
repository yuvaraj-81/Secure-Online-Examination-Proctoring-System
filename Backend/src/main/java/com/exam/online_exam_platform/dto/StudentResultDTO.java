package com.exam.online_exam_platform.dto;

import java.time.Instant;

public class StudentResultDTO {

    private Long id;
    private Long examId;
    private String examTitle;

    private int score;
    private int totalQuestions;
    private int correctAnswers;
    private int violations;

    private String status;

    // 🔥 FIX: use Instant (UTC)
    private Instant submittedAt;

    /* ===== constructor ===== */

    public StudentResultDTO(
            Long id,
            Long examId,
            String examTitle,
            int score,
            int totalQuestions,
            int correctAnswers,
            int violations,
            String status,
            Instant submittedAt
    ) {
        this.id = id;
        this.examId = examId;
        this.examTitle = examTitle;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.correctAnswers = correctAnswers;
        this.violations = violations;
        this.status = status;
        this.submittedAt = submittedAt;
    }

    /* ===== getters ===== */

    public Long getId() { return id; }
    public Long getExamId() { return examId; }
    public String getExamTitle() { return examTitle; }
    public int getScore() { return score; }
    public int getTotalQuestions() { return totalQuestions; }
    public int getCorrectAnswers() { return correctAnswers; }
    public int getViolations() { return violations; }
    public String getStatus() { return status; }

    public Instant getSubmittedAt() { return submittedAt; }
}
