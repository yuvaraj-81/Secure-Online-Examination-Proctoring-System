package com.exam.online_exam_platform.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.Duration;

@Entity
@Table(
        name = "exam_attempts",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "exam_id"})
)
public class ExamAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(optional = false)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttemptStatus status = AttemptStatus.ACTIVE;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    // SINGLE, CORRECT endsAt FIELD
    @Column(name = "ends_at", nullable = false)
    private Instant endsAt;

    @Lob
    @Column(name = "answers_json", columnDefinition = "TEXT")
    private String answersJson = "{}";

    @Column(nullable = false)
    private int violations = 0;

    @Column(name = "submission_reason")
    private String submissionReason;

    // NEW — STORES RANDOMIZED QUESTION IDS
    @Lob
    @Column(name = "question_order", columnDefinition = "TEXT")
    private String questionOrder;

    /* ================= HELPERS ================= */

    public boolean isExpired() {
        return Instant.now().isAfter(endsAt);
    }

    public long getRemainingSeconds() {
        return Math.max(
                0,
                Duration.between(Instant.now(), endsAt).getSeconds()
        );
    }

    /* ================= GETTERS ================= */

    public Long getId() { return id; }
    public User getStudent() { return student; }
    public Exam getExam() { return exam; }
    public AttemptStatus getStatus() { return status; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getEndsAt() { return endsAt; }
    public String getAnswersJson() { return answersJson; }
    public int getViolations() { return violations; }
    public String getSubmissionReason() { return submissionReason; }
    public String getQuestionOrder() { return questionOrder; }

    /* ================= SETTERS ================= */

    public void setStudent(User student) { this.student = student; }
    public void setExam(Exam exam) { this.exam = exam; }
    public void setStatus(AttemptStatus status) { this.status = status; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public void setEndsAt(Instant endsAt) { this.endsAt = endsAt; }
    public void setAnswersJson(String answersJson) { this.answersJson = answersJson; }
    public void setViolations(int violations) { this.violations = violations; }
    public void setSubmissionReason(String submissionReason) { this.submissionReason = submissionReason; }
    public void setQuestionOrder(String questionOrder) { this.questionOrder = questionOrder; } // 🔀 NEW
}
