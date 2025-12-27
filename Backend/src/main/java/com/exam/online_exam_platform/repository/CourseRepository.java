package com.exam.online_exam_platform.repository;

import com.exam.online_exam_platform.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
}
