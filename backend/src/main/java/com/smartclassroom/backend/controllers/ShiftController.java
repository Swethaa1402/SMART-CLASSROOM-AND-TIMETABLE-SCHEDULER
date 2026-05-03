package com.smartclassroom.backend.controllers;

import com.smartclassroom.backend.models.ShiftSuggestion;
import com.smartclassroom.backend.services.ShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shifts")
@RequiredArgsConstructor
public class ShiftController {

    private final ShiftService shiftService;

    @PostMapping("/suggest/{timetableId}/{teacherId}")
    public ResponseEntity<ShiftSuggestion> suggestShift(@PathVariable Long timetableId, @PathVariable Long teacherId) {
        return ResponseEntity.ok(shiftService.createShiftSuggestion(timetableId, teacherId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ShiftSuggestion>> getPendingSuggestions() {
        return ResponseEntity.ok(shiftService.getPendingSuggestions());
    }

    @PostMapping("/approve/{id}")
    public ResponseEntity<ShiftSuggestion> approveShift(@PathVariable Long id) {
        return ResponseEntity.ok(shiftService.approveShift(id));
    }

    @PostMapping("/reject/{id}")
    public ResponseEntity<ShiftSuggestion> rejectShift(@PathVariable Long id) {
        return ResponseEntity.ok(shiftService.rejectShift(id));
    }
    
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<ShiftSuggestion>> getTeacherShifts(@PathVariable Long teacherId) {
        return ResponseEntity.ok(shiftService.getTeacherShifts(teacherId));
    }

    @GetMapping("/incoming/{teacherId}")
    public ResponseEntity<List<ShiftSuggestion>> getIncomingShifts(@PathVariable Long teacherId) {
        return ResponseEntity.ok(shiftService.getIncomingShifts(teacherId));
    }
}
