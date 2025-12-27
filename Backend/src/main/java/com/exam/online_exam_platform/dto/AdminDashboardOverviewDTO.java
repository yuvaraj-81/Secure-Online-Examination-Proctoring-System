package com.exam.online_exam_platform.dto;

public class AdminDashboardOverviewDTO {

    private long totalStudents;
    private long totalCourses;
    private long totalExams;
    private long upcomingExams;
    private long completedExams;
    private double averageScore;
    private double passRate;

    public AdminDashboardOverviewDTO(
            long totalStudents,
            long totalCourses,
            long totalExams,
            long upcomingExams,
            long completedExams,
            double averageScore,
            double passRate
    ) {
        this.totalStudents = totalStudents;
        this.totalCourses = totalCourses;
        this.totalExams = totalExams;
        this.upcomingExams = upcomingExams;
        this.completedExams = completedExams;
        this.averageScore = averageScore;
        this.passRate = passRate;
    }

    public long getTotalStudents() { return totalStudents; }
    public long getTotalCourses() { return totalCourses; }
    public long getTotalExams() { return totalExams; }
    public long getUpcomingExams() { return upcomingExams; }
    public long getCompletedExams() { return completedExams; }
    public double getAverageScore() { return averageScore; }
    public double getPassRate() { return passRate; }
}
