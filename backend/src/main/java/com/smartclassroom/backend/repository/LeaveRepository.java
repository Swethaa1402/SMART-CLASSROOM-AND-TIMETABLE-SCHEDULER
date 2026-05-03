package com.smartclassroom.backend.repository;

import com.smartclassroom.backend.models.LeaveRequest;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<LeaveRequest, Long> {
    @Query(value = "select * from leave_requests where teacher_email = ?1 order by date desc", nativeQuery = true)
    List<LeaveRequest> findByTeacherEmailOrderByDateDesc(String email);

    @Query(value = "select * from leave_requests order by date desc", nativeQuery = true)
    List<LeaveRequest> findAllByOrderByDateDesc();

    @Query(value = "select * from leave_requests where user_id = ?1", nativeQuery = true)
    List<LeaveRequest> findByTeacherId(Long teacherId);

    @Modifying
    @Query(value = "delete from leave_requests where user_id = ?1", nativeQuery = true)
    void deleteByUserId(Long userId);
}
