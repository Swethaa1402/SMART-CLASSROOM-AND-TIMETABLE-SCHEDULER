package com.smartclassroom.backend.controllers;

import com.smartclassroom.backend.models.Classroom;
import com.smartclassroom.backend.models.Material;
import com.smartclassroom.backend.models.MaterialType;
import com.smartclassroom.backend.services.ClassroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classrooms")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomService classroomService;

    @PostMapping("/create/{teacherId}")
    public ResponseEntity<Classroom> createClassroom(@PathVariable Long teacherId, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(classroomService.createClassroom(teacherId, payload.get("name")));
    }

    @PostMapping("/join/{studentId}")
    public ResponseEntity<Classroom> joinClassroom(@PathVariable Long studentId, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(classroomService.joinClassroom(studentId, payload.get("code")));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Classroom>> getTeacherClassrooms(@PathVariable Long teacherId) {
        return ResponseEntity.ok(classroomService.getTeacherClassrooms(teacherId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Classroom>> getStudentClassrooms(@PathVariable Long studentId) {
        return ResponseEntity.ok(classroomService.getStudentClassrooms(studentId));
    }

    @PostMapping("/{classroomId}/materials")
    public ResponseEntity<Material> uploadMaterial(@PathVariable Long classroomId, @RequestBody Material material) {
        return ResponseEntity.ok(classroomService.uploadMaterial(classroomId, material.getTitle(), material.getLink(), material.getType()));
    }

    @GetMapping("/{classroomId}/materials")
    public ResponseEntity<List<Material>> getClassroomMaterials(@PathVariable Long classroomId) {
        return ResponseEntity.ok(classroomService.getClassroomMaterials(classroomId));
    }
}
