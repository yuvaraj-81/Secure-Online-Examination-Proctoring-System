package com.exam.online_exam_platform.controller;

import com.exam.online_exam_platform.entity.Course;
import com.exam.online_exam_platform.repository.CourseRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student/courses")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentCourseController {

    private final CourseRepository courseRepo;

    public StudentCourseController(CourseRepository courseRepo) {
        this.courseRepo = courseRepo;
    }

    @GetMapping
    public List<Course> getMyCourses() {
        // TEMP: later filter by logged-in student
        return courseRepo.findAll();
    }
}
