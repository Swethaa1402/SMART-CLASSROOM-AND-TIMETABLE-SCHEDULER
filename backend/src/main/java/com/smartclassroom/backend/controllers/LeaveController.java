package com.smartclassroom.backend.controllers;

import com.smartclassroom.backend.models.LeaveRequest;
import com.smartclassroom.backend.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leave")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveRepository leaveRepository;
    private final com.smartclassroom.backend.repository.UserRepository userRepository;
    private final com.smartclassroom.backend.repository.TimetableRepository timetableRepository;

    @PostMapping("/apply")
    public ResponseEntity<LeaveRequest> applyLeave(@RequestBody Map<String, Object> payload) {
        Long teacherId = Long.valueOf(payload.get("teacherId").toString());
        String reason = (String) payload.get("reason");
        LocalDate fromDate = LocalDate.parse((String) payload.get("fromDate"));
        LocalDate toDate = LocalDate.parse((String) payload.get("toDate"));

        com.smartclassroom.backend.models.User teacher = userRepository.findById(teacherId).orElse(null);
        if (teacher == null) {
            return ResponseEntity.badRequest().build();
        }

        String dayName = fromDate.getDayOfWeek().name();
        List<com.smartclassroom.backend.models.Timetable> schedules = timetableRepository.findByTeacherId(teacher.getId());
        
        // Find Replacement Teacher
        com.smartclassroom.backend.models.User replacement = null;
        List<com.smartclassroom.backend.models.User> allTeachers = userRepository.findAll().stream()
                .filter(u -> com.smartclassroom.backend.models.Role.TEACHER.equals(u.getRole()) && !u.getId().equals(teacher.getId()))
                .toList();

        for (com.smartclassroom.backend.models.Timetable t : schedules) {
            if (t.getDayOfWeek().equalsIgnoreCase(dayName)) {
                for (com.smartclassroom.backend.models.User cand : allTeachers) {
                    boolean isBusy = timetableRepository.existsByTeacherAndDayOfWeekAndStartTime(cand, t.getDayOfWeek(), t.getStartTime());
                    if (!isBusy) {
                        replacement = cand;
                        t.setTeacher(cand);
                        timetableRepository.save(t);
                        break;
                    }
                }
            }
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .teacher(teacher)
                .reason(reason)
                .fromDate(fromDate)
                .toDate(toDate)
                .status(LeaveRequest.LeaveStatus.PENDING)
                .replacementTeacher(replacement != null ? replacement.getName() : "None")
                .build();

        return ResponseEntity.ok(leaveRepository.save(leaveRequest));
    }

    @GetMapping("/history/{teacherId}")
    public ResponseEntity<List<LeaveRequest>> getLeaveHistory(@PathVariable Long teacherId) {
        com.smartclassroom.backend.models.User teacher = userRepository.findById(teacherId).orElse(null);
        if (teacher != null) {
            return ResponseEntity.ok(leaveRepository.findByTeacherEmailOrderByDateDesc(teacher.getEmail()));
        }
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/my-history/{teacherId}")
    public ResponseEntity<List<LeaveRequest>> getMyHistory(@PathVariable Long teacherId) {
        return getLeaveHistory(teacherId);
    }


    @GetMapping("/my")
    public ResponseEntity<List<LeaveRequest>> getMyLeaves(@RequestParam String email) {
        return ResponseEntity.ok(leaveRepository.findByTeacherEmailOrderByDateDesc(email));
    }

    @GetMapping("/all")
    public ResponseEntity<List<LeaveRequest>> getAllLeaves() {
        return ResponseEntity.ok(leaveRepository.findAllByOrderByDateDesc());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<LeaveRequest> approveLeave(@PathVariable Long id) {
        return leaveRepository.findById(id).map(leave -> {
            leave.setStatus(LeaveRequest.LeaveStatus.APPROVED);
            return ResponseEntity.ok(leaveRepository.save(leave));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<LeaveRequest> rejectLeave(@PathVariable Long id) {
        return leaveRepository.findById(id).map(leave -> {
            leave.setStatus(LeaveRequest.LeaveStatus.DECLINED);
            return ResponseEntity.ok(leaveRepository.save(leave));
        }).orElse(ResponseEntity.notFound().build());
    }
}
