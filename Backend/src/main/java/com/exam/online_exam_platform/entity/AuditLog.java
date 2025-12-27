package com.exam.online_exam_platform.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String action;
    private LocalDateTime timestamp;

    @PrePersist
    void onCreate() {
        timestamp = LocalDateTime.now();
    }

    // getters & setters
    public void setUserId(Long userId) { this.userId = userId; }
    public void setAction(String action) { this.action = action; }
}
