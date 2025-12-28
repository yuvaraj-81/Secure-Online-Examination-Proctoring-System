package com.exam.online_exam_platform.dto;

import java.time.LocalDateTime;

public class ResultPdfDTO {

    private String studentName;
    private String studentEmail;

    private String examTitle;
    private int score;
    private String resultStatus;

    private int totalQuestions;
    private int correctAnswers;
    private int violations;

    private LocalDateTime submittedAt;

    public ResultPdfDTO(
            String studentName,
            String studentEmail,
            String examTitle,
            int score,
            String resultStatus,
            int totalQuestions,
            int correctAnswers,
            int violations,
            LocalDateTime submittedAt
    ) {
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.examTitle = examTitle;
        this.score = score;
        this.resultStatus = resultStatus;
        this.totalQuestions = totalQuestions;
        this.correctAnswers = correctAnswers;
        this.violations = violations;
        this.submittedAt = submittedAt;
    }

    /* getters only */
    public String getStudentName() { return studentName; }
    public String getStudentEmail() { return studentEmail; }
    public String getExamTitle() { return examTitle; }
    public int getScore() { return score; }
    public String getResultStatus() { return resultStatus; }
    public int getTotalQuestions() { return totalQuestions; }
    public int getCorrectAnswers() { return correctAnswers; }
    public int getViolations() { return violations; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
}
