package com.exam.online_exam_platform.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity   // allows @PreAuthorize to work
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                /* ================= CORS ================= */
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                /* ================= CSRF ================= */
                .csrf(csrf -> csrf.disable())

                /* ================= SESSION ================= */
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                /* ================= AUTHORIZATION ================= */
                .authorizeHttpRequests(auth -> auth

                        // Preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public APIs
                        .requestMatchers("/auth/**", "/health").permitAll()

                        // Role-protected APIs (BACKEND AUTHORITY)
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/student/**").hasRole("STUDENT")

                        // Everything else
                        .anyRequest().authenticated()
                )

                /* ================= JWT FILTER ================= */
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /* ================= CORS CONFIG ================= */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // Frontend origin
        config.setAllowedOrigins(List.of("http://localhost:5173"));

        // HTTP methods
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        // Headers
        config.setAllowedHeaders(List.of("*"));

        // JWT via Authorization header
        config.setExposedHeaders(List.of("Authorization"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
