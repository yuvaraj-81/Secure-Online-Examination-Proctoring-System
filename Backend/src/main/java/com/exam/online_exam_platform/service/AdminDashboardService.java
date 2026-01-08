package com.exam.online_exam_platform.service;

import com.exam.online_exam_platform.dto.AdminDashboardOverviewDTO;
import com.exam.online_exam_platform.entity.Exam;
import com.exam.online_exam_platform.entity.Result;
import com.exam.online_exam_platform.entity.Role;
import com.exam.online_exam_platform.entity.User;
import com.exam.online_exam_platform.repository.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

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

        /* ================= TIME (UTC SAFE) ================= */

        LocalDateTime nowUtc = LocalDateTime.now(ZoneOffset.UTC);

        /* ================= KPI ================= */

        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalCourses = courseRepository.count();
        long totalExams = examRepository.count();

        long upcomingExams =
                examRepository.countByStartTimeAfter(nowUtc);

        long completedExams =
                examRepository.countByEndTimeBefore(nowUtc);

        double averageScore =
                Optional.ofNullable(resultRepository.findAverageScore())
                        .orElse(0.0);

        double passRate =
                Optional.ofNullable(resultRepository.findPassRate())
                        .orElse(0.0);

        List<Result> allResults = resultRepository.findAll();

        /* ================= RECENT EXAMS ================= */

        Map<Long, List<Result>> resultsByExam =
                allResults.stream()
                        .collect(Collectors.groupingBy(Result::getExamId));

        List<Map<String, Object>> recentExams = new ArrayList<>();

        for (var entry : resultsByExam.entrySet()) {
            Exam exam = examRepository.findById(entry.getKey()).orElse(null);
            if (exam == null) continue;

            Result latest =
                    entry.getValue().stream()
                            .filter(r -> r.getSubmittedAt() != null)
                            .max(Comparator.comparing(Result::getSubmittedAt))
                            .orElse(null);

            Map<String, Object> map = new HashMap<>();
            map.put("title", exam.getTitle());
            map.put("date", latest != null ? latest.getSubmittedAt() : null);
            map.put("participants", entry.getValue().size());

            recentExams.add(map);
        }

        recentExams.sort((a, b) -> {
            Instant d1 = (Instant) a.get("date");
            Instant d2 = (Instant) b.get("date");
            if (d1 == null) return 1;
            if (d2 == null) return -1;
            return d2.compareTo(d1);
        });

        recentExams = recentExams.stream()
                .limit(5)
                .toList();

        /* ================= STUDENT AVERAGES ================= */

        Map<Long, List<Result>> resultsByStudent =
                allResults.stream()
                        .collect(Collectors.groupingBy(Result::getStudentId));

        List<Map<String, Object>> studentAverages = new ArrayList<>();

        for (var entry : resultsByStudent.entrySet()) {
            User user = userRepository.findById(entry.getKey()).orElse(null);
            if (user == null) continue;

            long avgScore =
                    Math.round(
                            entry.getValue().stream()
                                    .mapToInt(Result::getScore)
                                    .average()
                                    .orElse(0)
                    );

            Map<String, Object> map = new HashMap<>();
            map.put("name", user.getName());
            map.put("score", avgScore);

            studentAverages.add(map);
        }

        /* ================= TOP STUDENTS ================= */

        List<Map<String, Object>> topStudents =
                studentAverages.stream()
                        .sorted((a, b) ->
                                ((Long) b.get("score"))
                                        .compareTo((Long) a.get("score"))
                        )
                        .limit(3)
                        .toList();

        /* ================= AT-RISK STUDENTS ================= */

        List<Map<String, Object>> atRiskStudents =
                studentAverages.stream()
                        .filter(s -> (Long) s.get("score") < 40)
                        .sorted((a, b) ->
                                ((Long) a.get("score"))
                                        .compareTo((Long) b.get("score"))
                        )
                        .limit(3)
                        .toList();

        /* ================= FINAL DTO ================= */

        return new AdminDashboardOverviewDTO(
                totalStudents,
                totalCourses,
                totalExams,
                upcomingExams,
                completedExams,
                averageScore,
                passRate,
                recentExams,
                topStudents,
                atRiskStudents
        );
    }
}
