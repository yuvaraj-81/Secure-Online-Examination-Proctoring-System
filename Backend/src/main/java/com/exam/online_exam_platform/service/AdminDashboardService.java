package com.exam.online_exam_platform.service;

import com.exam.online_exam_platform.dto.AdminDashboardOverviewDTO;
import com.exam.online_exam_platform.entity.Role;
import com.exam.online_exam_platform.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ExamRepository examRepository;
    private final ResultRepository resultRepository;

    public AdminDashboardService(
            UserRepository userRepository,
            CourseRepository courseRepository,
            ExamRepository examRepository,
            ResultRepository resultRepository
    ) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.examRepository = examRepository;
        this.resultRepository = resultRepository;
    }

    public AdminDashboardOverviewDTO getOverview() {

        long totalStudents =
                userRepository.countByRole(Role.STUDENT);

        long totalCourses =
                courseRepository.count();

        long totalExams =
                examRepository.count();

        long upcomingExams =
                examRepository.countByStartTimeAfter(LocalDateTime.now());

        long completedExams =
                examRepository.countByEndTimeBefore(LocalDateTime.now());

        double averageScore =
                resultRepository.findAverageScore() != null
                        ? resultRepository.findAverageScore()
                        : 0.0;

        double passRate =
                resultRepository.findPassRate() != null
                        ? resultRepository.findPassRate()
                        : 0.0;

        return new AdminDashboardOverviewDTO(
                totalStudents,
                totalCourses,
                totalExams,
                upcomingExams,
                completedExams,
                averageScore,
                passRate
        );
    }
}
