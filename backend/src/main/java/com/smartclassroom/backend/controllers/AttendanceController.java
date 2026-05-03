package com.smartclassroom.backend.controllers;

import com.smartclassroom.backend.services.AttendanceService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;


    // Teacher marks attendance
    @PostMapping("/mark")
    public ResponseEntity<String> markAttendance(@RequestBody AttendanceRequest request) {

        attendanceService.markAttendance(
                request.getStudentId(),
                request.isPresent(),
                request.getSubject()
        );

        return ResponseEntity.ok("Attendance Marked Successfully");
    }

    @GetMapping("/class/{className}")
    public ResponseEntity<java.util.List<com.smartclassroom.backend.models.User>> getStudentsByClass(@PathVariable String className) {
        return ResponseEntity.ok(attendanceService.getStudentsByClass(className));
    }

    @PostMapping("/batch")
    public ResponseEntity<String> markBatchAttendance(@RequestBody BatchAttendanceRequest request) {
        attendanceService.markBatchAttendance(
                request.getClassName(),
                request.getSubject(),
                request.getPresentStudentIds(),
                request.getAbsentStudentIds()
        );
        return ResponseEntity.ok("Batch Attendance Marked Successfully");
    }

    @Data
    public static class BatchAttendanceRequest {
        private String className;
        private String subject;
        private java.util.List<Long> presentStudentIds;
        private java.util.List<Long> absentStudentIds;
    }

    @Data
    public static class AttendanceRequest {

        private Long studentId;

        private boolean present;

        private String subject;
    }

}