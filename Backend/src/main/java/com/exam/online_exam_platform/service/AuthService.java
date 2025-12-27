package com.exam.online_exam_platform.service;

import com.exam.online_exam_platform.entity.AuditLog;
import com.exam.online_exam_platform.entity.Role;
import com.exam.online_exam_platform.entity.User;
import com.exam.online_exam_platform.repository.AuditLogRepository;
import com.exam.online_exam_platform.repository.UserRepository;
import com.exam.online_exam_platform.security.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final AuditLogRepository auditRepo;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(
            UserRepository userRepo,
            AuditLogRepository auditRepo,
            JwtUtil jwtUtil
    ) {
        this.userRepo = userRepo;
        this.auditRepo = auditRepo;
        this.jwtUtil = jwtUtil;
    }

    public void signup(String name, String email, String password) {

        if (userRepo.findByEmail(email).isPresent()) {
            throw new RuntimeException("User exists");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(encoder.encode(password));
        user.setRole(Role.STUDENT);

        userRepo.save(user);
    }

    public LoginResponse login(String email, String password) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!encoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        AuditLog log = new AuditLog();
        log.setUserId(user.getId());
        log.setAction("LOGIN");
        auditRepo.save(log);

        String token =
                jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new LoginResponse(token, user.getRole().name());
    }

    public record LoginResponse(String token, String role) {}
}
