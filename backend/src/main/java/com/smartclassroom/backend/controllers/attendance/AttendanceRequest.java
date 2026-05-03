package com.smartclassroom.backend.controllers.attendance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceRequest {
    private String className;
    private String subject;
    private LocalDate date;
    private List<StudentAttendance> students;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StudentAttendance {
        private Long studentId;
        private boolean present;
    }
}
