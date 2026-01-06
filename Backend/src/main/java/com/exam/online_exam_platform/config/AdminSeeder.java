package com.exam.online_exam_platform.config;

import com.exam.online_exam_platform.entity.Role;
import com.exam.online_exam_platform.entity.User;
import com.exam.online_exam_platform.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeeder {

    @Bean
    CommandLineRunner createAdmin(UserRepository userRepository,
                                  PasswordEncoder passwordEncoder) {
        return args -> {

            String adminEmail = "admin@test.com";
            String adminPassword = "admin123";

            if (userRepository.existsByEmail(adminEmail)) {
                System.out.println("✅ Admin already exists. Skipping creation.");
                return;
            }

            User admin = new User();
            admin.setName("Admin");
            admin.setEmail(adminEmail);
            admin.setRole(Role.ADMIN);
            admin.setPassword(passwordEncoder.encode(adminPassword));

            userRepository.save(admin);

            System.out.println("🚀 ADMIN CREATED");
            System.out.println("Email    : " + adminEmail);
            System.out.println("Password : " + adminPassword);
        };
    }
}
