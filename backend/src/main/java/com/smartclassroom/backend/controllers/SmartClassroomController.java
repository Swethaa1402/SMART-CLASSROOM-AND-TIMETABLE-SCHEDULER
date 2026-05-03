package com.smartclassroom.backend.controllers;

import com.smartclassroom.backend.models.Classroom;
import com.smartclassroom.backend.models.User;
import com.smartclassroom.backend.repository.UserRepository;
import com.smartclassroom.backend.services.ClassroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classroom")
@RequiredArgsConstructor
public class SmartClassroomController {

    private final ClassroomService classroomService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/create")
    public ResponseEntity<Classroom> createClassroom(@RequestBody Map<String, String> payload) {
        User teacher = getAuthenticatedUser();
        // Assuming user role checks are handled by SecurityConfig via endpoint security or implicitly
        return ResponseEntity.ok(classroomService.createClassroom(teacher.getId(), payload.get("classroomName")));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Classroom>> getMyClassrooms() {
        User teacher = getAuthenticatedUser();
        return ResponseEntity.ok(classroomService.getTeacherClassrooms(teacher.getId()));
    }

    @PostMapping("/join")
    public ResponseEntity<Classroom> joinClassroom(@RequestBody Map<String, String> payload) {
        User student = getAuthenticatedUser();
        return ResponseEntity.ok(classroomService.joinClassroom(student.getId(), payload.get("classroomCode")));
    }
    
    @GetMapping("/joined")
    public ResponseEntity<List<Classroom>> getJoinedClassrooms() {
        User student = getAuthenticatedUser();
        return ResponseEntity.ok(classroomService.getStudentClassrooms(student.getId()));
    }
}
