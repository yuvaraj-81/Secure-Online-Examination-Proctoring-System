package com.exam.online_exam_platform.dto;

import java.time.LocalDateTime;

public class AdminResultDTO {

    private Long resultId;

    private Long studentId;
    private String studentName;
    private String studentEmail;

    private Long examId;
    private String examTitle;

    private int score;
    private int totalQuestions;
    private int correctAnswers;
    private int violations;

    private String status;
    private String submissionReason;
    private LocalDateTime submittedAt;

    public AdminResultDTO(
            Long resultId,
            Long studentId,
            String studentName,
            String studentEmail,
            Long examId,
            String examTitle,
            int score,
            int totalQuestions,
            int correctAnswers,
            int violations,
            String status,
            String submissionReason,
            LocalDateTime submittedAt
    ) {
        this.resultId = resultId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.examId = examId;
        this.examTitle = examTitle;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.correctAnswers = correctAnswers;
        this.violations = violations;
        this.status = status;
        this.submissionReason = submissionReason;
        this.submittedAt = submittedAt;
    }

    /* getters only (DTO = read-only) */

    public Long getResultId() { return resultId; }
    public Long getStudentId() { return studentId; }
    public String getStudentName() { return studentName; }
    public String getStudentEmail() { return studentEmail; }
    public Long getExamId() { return examId; }
    public String getExamTitle() { return examTitle; }
    public int getScore() { return score; }
    public int getTotalQuestions() { return totalQuestions; }
    public int getCorrectAnswers() { return correctAnswers; }
    public int getViolations() { return violations; }
    public String getStatus() { return status; }
    public String getSubmissionReason() { return submissionReason; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
}
