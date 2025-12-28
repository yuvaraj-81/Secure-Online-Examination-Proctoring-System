package com.exam.online_exam_platform.dto;

import java.time.LocalDateTime;

public class StudentDashboardDTO {

    private int totalExams;
    private int attempted;
    private int passed;
    private int failed;
    private int averageScore;
    private int completionPercent;
    private int upcomingExams;

    private LatestExam latestExam;

    public static class LatestExam {
        public Long examId;
        public String title;
        public int score;
        public String status;
        public LocalDateTime submittedAt;
    }

    /* ===== constructor ===== */

    public StudentDashboardDTO(
            int totalExams,
            int attempted,
            int passed,
            int failed,
            int averageScore,
            int completionPercent,
            int upcomingExams,
            LatestExam latestExam
    ) {
        this.totalExams = totalExams;
        this.attempted = attempted;
        this.passed = passed;
        this.failed = failed;
        this.averageScore = averageScore;
        this.completionPercent = completionPercent;
        this.upcomingExams = upcomingExams;
        this.latestExam = latestExam;
    }

    /* ===== getters ===== */

    public int getTotalExams() { return totalExams; }
    public int getAttempted() { return attempted; }
    public int getPassed() { return passed; }
    public int getFailed() { return failed; }
    public int getAverageScore() { return averageScore; }
    public int getCompletionPercent() { return completionPercent; }
    public int getUpcomingExams() { return upcomingExams; }
    public LatestExam getLatestExam() { return latestExam; }
}
