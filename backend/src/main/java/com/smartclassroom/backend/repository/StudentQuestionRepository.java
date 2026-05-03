package com.smartclassroom.backend.repository;

import com.smartclassroom.backend.models.StudentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentQuestionRepository extends JpaRepository<StudentQuestion, Long> {
    List<StudentQuestion> findByStudentEmailOrderByCreatedAtDesc(String studentEmail);
    List<StudentQuestion> findByStatusOrderByCreatedAtDesc(StudentQuestion.QuestionStatus status);
    List<StudentQuestion> findAllByOrderByCreatedAtDesc();
}
