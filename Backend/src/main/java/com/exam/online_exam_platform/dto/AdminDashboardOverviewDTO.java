package com.exam.online_exam_platform.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AdminDashboardOverviewDTO {

    private long totalStudents;
    private long totalCourses;
    private long totalExams;
    private long upcomingExams;
    private long completedExams;
    private double averageScore;
    private double passRate;

    private List<Map<String, Object>> recentExams;
    private List<Map<String, Object>> topStudents;
    private List<Map<String, Object>> atRiskStudents;

    public AdminDashboardOverviewDTO(
            long totalStudents,
            long totalCourses,
            long totalExams,
            long upcomingExams,
            long completedExams,
            double averageScore,
            double passRate,
            List<Map<String, Object>> recentExams,
            List<Map<String, Object>> topStudents,
            List<Map<String, Object>> atRiskStudents
    ) {
        this.totalStudents = totalStudents;
        this.totalCourses = totalCourses;
        this.totalExams = totalExams;
        this.upcomingExams = upcomingExams;
        this.completedExams = completedExams;
        this.averageScore = averageScore;
        this.passRate = passRate;
        this.recentExams = recentExams;
        this.topStudents = topStudents;
        this.atRiskStudents = atRiskStudents;
    }

    public long getTotalStudents() { return totalStudents; }
    public long getTotalCourses() { return totalCourses; }
    public long getTotalExams() { return totalExams; }
    public long getUpcomingExams() { return upcomingExams; }
    public long getCompletedExams() { return completedExams; }
    public double getAverageScore() { return averageScore; }
    public double getPassRate() { return passRate; }

    public List<Map<String, Object>> getRecentExams() { return recentExams; }
    public List<Map<String, Object>> getTopStudents() { return topStudents; }
    public List<Map<String, Object>> getAtRiskStudents() { return atRiskStudents; }
}
