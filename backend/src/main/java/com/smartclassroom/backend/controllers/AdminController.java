package com.smartclassroom.backend.controllers;

import com.smartclassroom.backend.controllers.auth.AuthenticationResponse;
import com.smartclassroom.backend.controllers.auth.RegisterRequest;
import com.smartclassroom.backend.models.Announcement;
import com.smartclassroom.backend.models.Role;
import com.smartclassroom.backend.models.LeaveRequest;
import com.smartclassroom.backend.models.Timetable;
import com.smartclassroom.backend.models.User;
import com.smartclassroom.backend.repository.AnnouncementRepository;
import com.smartclassroom.backend.repository.LeaveRepository;
import com.smartclassroom.backend.repository.TimetableRepository;
import com.smartclassroom.backend.services.AuthenticationService;
import com.smartclassroom.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final AuthenticationService authenticationService;
    private final AnnouncementRepository announcementRepository;
    private final LeaveRepository leaveRepository;
    private final TimetableRepository timetableRepository;

    // --- User Management ---
    @PostMapping("/user/add")
    public ResponseEntity<AuthenticationResponse> addUser(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authenticationService.register(request));
    }

    @DeleteMapping("/user/delete/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(@RequestParam(required = false) Role role) {
        if (role != null) {
            return ResponseEntity.ok(userService.getUsersByRole(role));
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }


    // --- Announcements ---
    @PostMapping("/announcement/add")
    public ResponseEntity<Announcement> addAnnouncement(@RequestBody Map<String, String> payload, Authentication authentication) {
        User adminUser = userService.getUserByEmail(authentication.getName());
        Announcement announcement = Announcement.builder()
                .title(payload.get("title"))
                .message(payload.get("message"))
                .createdAt(LocalDateTime.now())
                .postedBy(adminUser)
                .build();
        return ResponseEntity.ok(announcementRepository.save(announcement));
    }

    @DeleteMapping("/announcement/delete/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/announcement/all")
    public ResponseEntity<List<Announcement>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementRepository.findAllByOrderByCreatedAtDesc());
    }


    // --- Leave Approval ---
    @PostMapping("/leave/approve/{id}")
    public ResponseEntity<LeaveRequest> approveLeave(@PathVariable Long id) {
        return leaveRepository.findById(id).map(leave -> {
            leave.setStatus(LeaveRequest.LeaveStatus.APPROVED);
            // Logic to reassign class could be added here if needed
            return ResponseEntity.ok(leaveRepository.save(leave));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/leave/decline/{id}")
    public ResponseEntity<LeaveRequest> declineLeave(@PathVariable Long id) {
        return leaveRepository.findById(id).map(leave -> {
            leave.setStatus(LeaveRequest.LeaveStatus.DECLINED);
            // This endpoint is effectively deprecated and safely maps to DECLINED now.
            return ResponseEntity.ok(leaveRepository.save(leave));
        }).orElse(ResponseEntity.notFound().build());
    }


    // --- Timetable Management ---
    @PostMapping("/timetable/save")
    public ResponseEntity<Timetable> saveTimetable(@RequestBody Timetable timetable) {
        return ResponseEntity.ok(timetableRepository.save(timetable));
    }

    @GetMapping("/timetable/all")
    public ResponseEntity<List<Timetable>> getAllTimetables() {
        return ResponseEntity.ok(timetableRepository.findAll());
    }
}
