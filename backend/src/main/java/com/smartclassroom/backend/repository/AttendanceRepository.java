package com.smartclassroom.backend.repository;

import com.smartclassroom.backend.models.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance,Long> {

    List<Attendance> findByStudentId(Long studentId);

    List<Attendance> findByStudentIdAndDate(Long studentId, LocalDate date);

    void deleteByStudentId(Long studentId);

}
