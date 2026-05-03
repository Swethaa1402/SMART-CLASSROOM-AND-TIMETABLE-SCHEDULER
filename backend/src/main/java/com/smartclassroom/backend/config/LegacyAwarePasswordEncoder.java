package com.smartclassroom.backend.config;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Supports both BCrypt-hashed passwords and legacy/plaintext passwords already stored in DB.
 *
 * - If stored password looks like BCrypt ($2a/$2b/$2y), delegate to BCrypt.
 * - Otherwise, fall back to constant-time raw==stored comparison.
 *
 * NOTE: This does not change schema and avoids breaking existing users.
 */
public class LegacyAwarePasswordEncoder implements PasswordEncoder {
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

    @Override
    public String encode(CharSequence rawPassword) {
        return bcrypt.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (encodedPassword == null) return false;
        if (looksLikeBcrypt(encodedPassword)) {
            return bcrypt.matches(rawPassword, encodedPassword);
        }
        // Legacy/plaintext fallback
        byte[] a = rawPassword == null ? new byte[0] : rawPassword.toString().getBytes(StandardCharsets.UTF_8);
        byte[] b = encodedPassword.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(a, b);
    }

    private boolean looksLikeBcrypt(String value) {
        return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
    }
}

