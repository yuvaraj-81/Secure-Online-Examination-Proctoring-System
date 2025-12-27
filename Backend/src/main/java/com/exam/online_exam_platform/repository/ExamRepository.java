package com.exam.online_exam_platform.repository;

import com.exam.online_exam_platform.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    long countByStartTimeAfter(LocalDateTime now);
    long countByEndTimeBefore(LocalDateTime now);

}
