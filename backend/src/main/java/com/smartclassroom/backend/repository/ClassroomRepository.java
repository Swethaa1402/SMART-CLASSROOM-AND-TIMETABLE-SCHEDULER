package com.smartclassroom.backend.repository;

import com.smartclassroom.backend.models.Classroom;
import com.smartclassroom.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    Optional<Classroom> findByUniqueCode(String uniqueCode);
    List<Classroom> findByTeacherId(Long teacherId);
    List<Classroom> findByStudentsContains(User student);
}
