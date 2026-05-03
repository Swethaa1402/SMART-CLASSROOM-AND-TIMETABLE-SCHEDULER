package com.smartclassroom.backend.repository;

import com.smartclassroom.backend.models.ShiftSuggestion;
import com.smartclassroom.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShiftSuggestionRepository extends JpaRepository<ShiftSuggestion, Long> {
    List<ShiftSuggestion> findByStatus(com.smartclassroom.backend.models.ShiftStatus status);
    List<ShiftSuggestion> findByOriginalTeacherId(Long teacherId);
    List<ShiftSuggestion> findBySuggestedTeacherId(Long teacherId);
    void deleteByOriginalTeacherIdOrSuggestedTeacherId(Long originalTeacherId, Long suggestedTeacherId);
}
