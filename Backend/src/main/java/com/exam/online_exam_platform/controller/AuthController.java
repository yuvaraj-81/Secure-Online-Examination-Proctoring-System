package com.exam.online_exam_platform.controller;

import com.exam.online_exam_platform.entity.User;
import com.exam.online_exam_platform.entity.Role;
import com.exam.online_exam_platform.repository.UserRepository;
import com.exam.online_exam_platform.service.AuthService;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            AuthService authService,
            UserRepository userRepo,
            PasswordEncoder passwordEncoder
    ) {
        this.authService = authService;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    /* ================= SIGNUP ================= */

    @PostMapping("/signup")
    public void signup(@RequestBody SignupRequest req) {

        if (userRepo.existsByEmail(req.email())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(req.name());               // 🔥 FIX
        user.setEmail(req.email());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setRole(Role.STUDENT);

        userRepo.save(user);
    }


    /* ================= LOGIN ================= */

    @PostMapping("/login")
    public AuthService.LoginResponse login(@RequestBody LoginRequest req) {
        return authService.login(req.email(), req.password());
    }

    /* ================= HEALTH ================= */

    @GetMapping("/ping")
    public String ping() {
        return "AUTH OK";
    }

    /* ================= REQUEST DTOs ================= */

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record SignupRequest(
            String name,
            String email,
            String password
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record LoginRequest(
            String email,
            String password
    ) {}
}
