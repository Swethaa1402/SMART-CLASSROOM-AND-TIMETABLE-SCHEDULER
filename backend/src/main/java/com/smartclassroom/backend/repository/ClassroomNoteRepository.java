package com.smartclassroom.backend.repository;

import com.smartclassroom.backend.models.ClassroomNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassroomNoteRepository extends JpaRepository<ClassroomNote, Long> {
    List<ClassroomNote> findByClassroomIdAndStudentEmailOrderByCreatedAtDesc(Long classroomId, String studentEmail);
}
