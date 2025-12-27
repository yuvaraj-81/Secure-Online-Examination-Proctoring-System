package com.exam.online_exam_platform.controller;

import com.exam.online_exam_platform.entity.Course;
import com.exam.online_exam_platform.service.AdminCourseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/courses")
public class AdminCourseController {

    private final AdminCourseService courseService;

    public AdminCourseController(AdminCourseService courseService) {
        this.courseService = courseService;
    }

    /* ================= CREATE ================= */

    @PostMapping
    public void addCourse(@RequestBody Course course) {
        courseService.addCourse(course);
    }

    /* ================= READ ================= */

    @GetMapping
    public List<Course> getCourses() {
        return courseService.getAllCourses();
    }

    /* ================= UPDATE ================= */

    @PutMapping("/{id}")
    public void updateCourse(
            @PathVariable Long id,
            @RequestBody Course course
    ) {
        courseService.updateCourse(id, course);
    }

    /* ================= DELETE ================= */

    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
    }
}
