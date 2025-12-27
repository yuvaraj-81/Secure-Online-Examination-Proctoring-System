package com.exam.online_exam_platform.controller;

import com.exam.online_exam_platform.entity.User;
import com.exam.online_exam_platform.security.AuthUtil;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/student/profile")
public class StudentProfileController {

    private final AuthUtil authUtil;

    public StudentProfileController(AuthUtil authUtil) {
        this.authUtil = authUtil;
    }

    @GetMapping
    public User profile() {
        return authUtil.getCurrentUser();
    }
}
