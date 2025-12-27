package com.exam.online_exam_platform.service;

import com.exam.online_exam_platform.entity.Course;
import com.exam.online_exam_platform.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminCourseService {

    private final CourseRepository courseRepository;

    public AdminCourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    /* ================= CREATE ================= */

    public void addCourse(Course course) {
        courseRepository.save(course);
    }

    /* ================= READ ================= */

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    /* ================= UPDATE ================= */

    public void updateCourse(Long id, Course updatedCourse) {
        Course existing = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        existing.setCourseCode(updatedCourse.getCourseCode());
        existing.setCourseName(updatedCourse.getCourseName());
        existing.setDescription(updatedCourse.getDescription());

        courseRepository.save(existing);
    }

    /* ================= DELETE ================= */

    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("Course not found");
        }
        courseRepository.deleteById(id);
    }
}
