package com.smartclassroom.backend.services;

import com.smartclassroom.backend.controllers.auth.AuthenticationRequest;
import com.smartclassroom.backend.controllers.auth.AuthenticationResponse;
import com.smartclassroom.backend.controllers.auth.RegisterRequest;
import com.smartclassroom.backend.models.User;
import com.smartclassroom.backend.repository.UserRepository;
import com.smartclassroom.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // ===========================
    // REGISTER NEW USER
    // ===========================
    public AuthenticationResponse register(RegisterRequest request) {

        if (repository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Encode password
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(encodedPassword);
        user.setRole(request.getRole()); // Role is enum
        user.setClassName(request.getClassName());
        user.setStreak(0);
        user.setEnabled(true);

        // Save user
        User savedUser = repository.save(user);

        // Generate JWT
        String jwtToken = jwtService.generateToken(savedUser);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .token(jwtToken)
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .className(savedUser.getClassName())
                .build();
    }

    // ===========================
    // LOGIN EXISTING USER
    // ===========================
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        User user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isEnabled()) {
            throw new RuntimeException("User account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Bad credentials");
        }

        // Generate JWT
        String jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .token(jwtToken)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .className(user.getClassName())
                .build();
    }
}
