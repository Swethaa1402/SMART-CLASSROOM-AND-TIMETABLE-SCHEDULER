package com.smartclassroom.backend.repository;

import com.smartclassroom.backend.models.Timetable;
import com.smartclassroom.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findByClassName(String className);
    List<Timetable> findByClassNameIgnoreCase(String className);
    List<Timetable> findByClassNameStartingWithIgnoreCase(String className);
    List<Timetable> findByClassNameContainingIgnoreCase(String className);
    List<Timetable> findByTeacherId(Long teacherId);
    List<Timetable> findByTeacher_Email(String email);
    boolean existsByTeacherAndDayOfWeekAndStartTime(User teacher, String dayOfWeek, String startTime);
    boolean existsByTeacherIdAndDayOfWeekAndStartTime(Long teacherId, String dayOfWeek, String startTime);
    List<Timetable> findByDayOfWeekAndStartTimeAndEndTime(String dayOfWeek, String startTime, String endTime);
}
