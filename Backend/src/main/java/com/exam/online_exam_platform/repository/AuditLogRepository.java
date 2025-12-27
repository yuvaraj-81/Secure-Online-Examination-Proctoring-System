package com.exam.online_exam_platform.repository;

import com.exam.online_exam_platform.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
