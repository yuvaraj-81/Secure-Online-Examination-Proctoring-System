package com.exam.online_exam_platform.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey key;

    public JwtUtil(@Value("${jwt.secret}") String secret) {

        if (secret == null || secret.trim().length() < 32) {
            throw new IllegalStateException(
                    "jwt.secret must be at least 32 characters long for HS256"
            );
        }

        this.key = Keys.hmacShaKeyFor(
                secret.trim().getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role) // MUST be STUDENT / ADMIN
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 24h
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public SecretKey getKey() {
        return key;
    }
}
