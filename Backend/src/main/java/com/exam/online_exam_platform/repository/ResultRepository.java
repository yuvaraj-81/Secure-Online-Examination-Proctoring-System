package com.exam.online_exam_platform.repository;

import com.exam.online_exam_platform.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ResultRepository extends JpaRepository<Result, Long> {

    // Prevent duplicate result per attempt (MOST IMPORTANT)
    boolean existsByExamAttemptId(Long examAttemptId);

    // Fetch result for a specific attempt
    Optional<Result> findByExamAttemptId(Long examAttemptId);

    // Student result history
    List<Result> findByStudentId(Long studentId);

    // (optional) exam-wise results
    List<Result> findByExamId(Long examId);

    @Query("SELECT AVG(r.score) FROM Result r")
    Double findAverageScore();

    @Query("""
    SELECT 
      (SUM(CASE WHEN r.score >= 40 THEN 1 ELSE 0 END) * 100.0) / COUNT(r)
    FROM Result r
""")
    Double findPassRate();

}
