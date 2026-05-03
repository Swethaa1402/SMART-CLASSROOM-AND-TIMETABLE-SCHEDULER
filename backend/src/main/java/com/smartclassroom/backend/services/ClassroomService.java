package com.smartclassroom.backend.services;

import com.smartclassroom.backend.models.Classroom;
import com.smartclassroom.backend.models.Material;
import com.smartclassroom.backend.models.MaterialType;
import com.smartclassroom.backend.models.User;
import com.smartclassroom.backend.repository.ClassroomRepository;
import com.smartclassroom.backend.repository.MaterialRepository;
import com.smartclassroom.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;
    private final MaterialRepository materialRepository;

    public Classroom createClassroom(Long teacherId, String name) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        String uniqueCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        
        Classroom classroom = Classroom.builder()
                .name(name)
                .teacher(teacher)
                .uniqueCode(uniqueCode)
                .build();
        
        return classroomRepository.save(classroom);
    }

    public Classroom joinClassroom(Long studentId, String code) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        Classroom classroom = classroomRepository.findByUniqueCode(code)
                .orElseThrow(() -> new RuntimeException("Invalid classroom code"));
        
        classroom.getStudents().add(student);
        return classroomRepository.save(classroom);
    }

    public List<Classroom> getTeacherClassrooms(Long teacherId) {
        return classroomRepository.findByTeacherId(teacherId);
    }

    public List<Classroom> getStudentClassrooms(Long studentId) {
        User student = userRepository.findById(studentId).orElseThrow();
        return classroomRepository.findByStudentsContains(student);
    }

    public Material uploadMaterial(Long classroomId, String title, String link, MaterialType type) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        
        Material material = Material.builder()
                .title(title)
                .link(link)
                .type(type)
                .classroom(classroom)
                .build();
        
        return materialRepository.save(material);
    }
    
    public List<Material> getClassroomMaterials(Long classroomId) {
        return materialRepository.findByClassroomId(classroomId);
    }
}
