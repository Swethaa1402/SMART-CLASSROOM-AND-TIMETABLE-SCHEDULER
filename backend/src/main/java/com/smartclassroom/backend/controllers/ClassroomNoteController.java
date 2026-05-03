package com.smartclassroom.backend.controllers;

import com.smartclassroom.backend.models.ClassroomNote;
import com.smartclassroom.backend.repository.ClassroomNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class ClassroomNoteController {

    private final ClassroomNoteRepository classroomNoteRepository;

    private String getAuthenticatedUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    @PostMapping("/save")
    public ResponseEntity<ClassroomNote> saveNote(@RequestBody ClassroomNote note) {
        // Enforce the logged-in user's email
        note.setStudentEmail(getAuthenticatedUserEmail());
        return ResponseEntity.ok(classroomNoteRepository.save(note));
    }

    @GetMapping("/history/{classroomId}")
    public ResponseEntity<List<ClassroomNote>> getHistory(@PathVariable Long classroomId) {
        return ResponseEntity.ok(classroomNoteRepository.findByClassroomIdAndStudentEmailOrderByCreatedAtDesc(classroomId, getAuthenticatedUserEmail()));
    }
}
