package com.exam.online_exam_platform.security;

import com.exam.online_exam_platform.entity.User;
import com.exam.online_exam_platform.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthUtil {

    private final UserRepository userRepository;

    public AuthUtil(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Returns the currently authenticated User entity
     */
    public User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }

        String email = authentication.getName(); // username/email from JWT

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found: " + email)
                );
    }
}
