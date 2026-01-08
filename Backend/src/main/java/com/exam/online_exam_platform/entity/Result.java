package com.exam.online_exam_platform.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
        name = "results",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "exam_id"})
        }
)
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* ================= IDENTIFIERS ================= */

    @Column(name = "user_id", nullable = false)
    private Long studentId;

    @Column(name = "exam_id", nullable = false)
    private Long examId;

    @Column(name = "exam_attempt_id", nullable = false, unique = true)
    private Long examAttemptId;

    /* ================= EVALUATION ================= */

    @Column(nullable = false)
    private int score;

    @Column(name = "total_questions", nullable = false)
    private int totalQuestions;

    @Column(name = "correct_answers", nullable = false)
    private int correctAnswers;

    @Column(nullable = false)
    private int violations;

    /* ================= STATUS ================= */

    @Column(name = "submission_reason", length = 50)
    private String submissionReason;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    /* 🔥 FIX: USE INSTANT (UTC) */
    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    /* ================= GETTERS & SETTERS ================= */

    public Long getId() { return id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }

    public Long getExamAttemptId() { return examAttemptId; }
    public void setExamAttemptId(Long examAttemptId) { this.examAttemptId = examAttemptId; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public int getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(int correctAnswers) { this.correctAnswers = correctAnswers; }

    public int getViolations() { return violations; }
    public void setViolations(int violations) { this.violations = violations; }

    public String getSubmissionReason() { return submissionReason; }
    public void setSubmissionReason(String submissionReason) { this.submissionReason = submissionReason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
}
