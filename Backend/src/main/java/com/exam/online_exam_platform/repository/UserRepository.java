package com.exam.online_exam_platform.repository;

import com.exam.online_exam_platform.entity.Role;
import com.exam.online_exam_platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRole(Role role);

    List<User> findByRole(Role role);
}
