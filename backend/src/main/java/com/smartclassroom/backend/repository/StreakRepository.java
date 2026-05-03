package com.smartclassroom.backend.repository;

import com.smartclassroom.backend.models.Streak;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StreakRepository extends JpaRepository<Streak, Long> {

    Optional<Streak> findByStudentId(Long studentId);

    void deleteByStudentId(Long studentId);

}
