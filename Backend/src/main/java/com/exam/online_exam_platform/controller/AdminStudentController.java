package com.exam.online_exam_platform.controller;

import com.exam.online_exam_platform.entity.User;
import com.exam.online_exam_platform.service.AdminStudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/students")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminStudentController {

    private final AdminStudentService studentService;

    // ✅ Explicit constructor (Maven & Docker safe)
    public AdminStudentController(AdminStudentService studentService) {
        this.studentService = studentService;
    }

    /* ================= STUDENTS ================= */

    // ✅ GET ALL STUDENTS
    @GetMapping
    public List<User> getStudents() {
        return studentService.getAllStudents();
    }

    // ✅ ADD STUDENT
    @PostMapping
    public ResponseEntity<User> addStudent(@RequestBody User user) {
        User created = studentService.createStudent(user);
        return ResponseEntity.ok(created);
    }

    // ✅ UPDATE STUDENT
    @PutMapping("/{studentId}")
    public ResponseEntity<?> updateStudent(
            @PathVariable Long studentId,
            @RequestBody User user
    ) {
        studentService.updateStudent(studentId, user);
        return ResponseEntity.ok().build();
    }

    // ✅ DELETE STUDENT
    @DeleteMapping("/{studentId}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long studentId) {
        try {
            studentService.deleteStudent(studentId);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
