package com.smartclassroom.backend.services;

import com.smartclassroom.backend.models.Attendance;
import com.smartclassroom.backend.models.User;
import com.smartclassroom.backend.repository.AttendanceRepository;
import com.smartclassroom.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public Attendance markAttendance(Long studentId, boolean present, String subject) {

        User student = userRepository.findById(studentId).orElseThrow();

        LocalDate today = LocalDate.now();

        Attendance attendance;

        if(attendanceRepository.findByStudentIdAndDate(studentId, today).isEmpty()){

            attendance = Attendance.builder()
                    .studentId(studentId)
                    .date(today)
                    .subject(subject)
                    .className(student.getClassName())
                    .present(present)
                    .build();

        } else {

            attendance = attendanceRepository
                    .findByStudentIdAndDate(studentId,today)
                    .get(0);

            attendance.setPresent(present);
        }

        attendanceRepository.save(attendance);

        // ⭐ STREAK LOGIC
        if (present) {
            student.setStreak(student.getStreak() + 1);
        }
        // If absent, streak remains the same as per requirements.

        userRepository.save(student);

        return attendance;
    }


    public List<Attendance> getStudentAttendance(Long studentId){
        return attendanceRepository.findByStudentId(studentId);
    }


    public List<User> getStudentsByClass(String className){
        return userRepository.findByClassName(className);
    }


    public void markBatchAttendance(String className,String subject,List<Long> presentIds,List<Long> absentIds){

        for(Long id:presentIds){
            markAttendance(id,true,subject);
        }

        for(Long id:absentIds){
            markAttendance(id,false,subject);
        }

    }

}