package com.smartclassroom.backend.controllers;

import com.smartclassroom.backend.models.User;
import com.smartclassroom.backend.repository.UserRepository;
import com.smartclassroom.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5176"})
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    // Get all users with optional role filter
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(@RequestParam(required = false) com.smartclassroom.backend.models.Role role) {
        if (role != null) {
            return ResponseEntity.ok(userRepository.findByRole(role));
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }


    // Enable or disable user
    @PutMapping("/{id}/enable")
    public ResponseEntity<User> enableUser(@PathVariable Long id, @RequestParam boolean enabled) {
        return ResponseEntity.ok(userService.enableUser(id, enabled));
    }

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    // Get student streak
    @GetMapping("/{id}/streak")
    public ResponseEntity<Integer> getStudentStreak(@PathVariable Long id) {
        User student = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return ResponseEntity.ok(student.getStreak());
    }
}