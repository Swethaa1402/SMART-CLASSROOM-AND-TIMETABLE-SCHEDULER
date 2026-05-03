package com.smartclassroom.backend.controllers;
import com.smartclassroom.backend.services.TimetableAutoService;
import com.smartclassroom.backend.models.Timetable;
import com.smartclassroom.backend.repository.TimetableRepository;
import com.smartclassroom.backend.repository.UserRepository;
import com.smartclassroom.backend.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.smartclassroom.backend.services.AITimetableService;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.ArrayList;
import java.util.Comparator;
import com.smartclassroom.backend.models.TimetableConfigRequest;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableController {
    private final TimetableAutoService autoService;
    private final TimetableRepository repository;
    private final UserRepository userRepository;
    private final AITimetableService aiService;

    @GetMapping
    public ResponseEntity<List<Timetable>> getTimetable(@RequestParam(required = false) String className) {
        List<Timetable> result;
        if (className != null && !className.isEmpty()) {
            result = repository.findByClassName(className);
        } else {
            result = repository.findAll();
        }
        return ResponseEntity.ok(result != null ? result : new ArrayList<>());
    }
    
    @GetMapping("/teacher/{id}")
    public List<Timetable> getByTeacher(@PathVariable Long id) {
        List<Timetable> result = repository.findByTeacherId(id);
        return result != null ? result : new ArrayList<>();
    }

    @GetMapping("/teacher-email/{email}")
    public ResponseEntity<List<Timetable>> getTimetableByTeacherEmail(@PathVariable String email) {
        List<Timetable> result = repository.findByTeacher_Email(email);
        if ((result == null || result.isEmpty()) && email != null) {
            User teacher = userRepository.findByEmail(email).orElse(null);
            if (teacher != null) {
                result = repository.findByTeacherId(teacher.getId());
            }
        }
        sortTimetables(result);
        return ResponseEntity.ok(result != null ? result : new ArrayList<>());
    }

    @GetMapping("/student/{className}")
    public List<Timetable> getByClass(@PathVariable String className) {
        String normalizedClassName = className == null ? "" : className.trim();
        List<Timetable> entries = repository.findByClassNameIgnoreCase(normalizedClassName);
        if ((entries == null || entries.isEmpty()) && !normalizedClassName.isEmpty()) {
            entries = repository.findByClassNameStartingWithIgnoreCase(normalizedClassName + "-");
        }
        if ((entries == null || entries.isEmpty()) && !normalizedClassName.isEmpty()) {
            entries = repository.findByClassNameContainingIgnoreCase(normalizedClassName);
        }
        sortTimetables(entries);
        return entries != null ? entries : new ArrayList<>();
    }

    @PostMapping
    public ResponseEntity<Timetable> createEntry(@RequestBody Timetable timetable) {
        return ResponseEntity.ok(repository.save(timetable));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Timetable> updateEntry(@PathVariable Long id, @RequestBody Timetable timetable) {
        Timetable existing = repository.findById(id).orElseThrow();
        existing.setSubject(timetable.getSubject());
        existing.setDayOfWeek(timetable.getDayOfWeek());
        existing.setStartTime(timetable.getStartTime());
        existing.setEndTime(timetable.getEndTime());
        // existing.setTeacher(timetable.getTeacher()); // If needed
        return ResponseEntity.ok(repository.save(existing));
    }

    @PostMapping("/generateAI/{className}")
    public ResponseEntity<String> generateAI(
        @PathVariable String className){

        aiService.generateSmartTimetable(className);

        return ResponseEntity.ok("AI Timetable Generated");

    }
    @PostMapping("/generate-auto")
    public ResponseEntity<String> generateAutoTimetable(@RequestBody TimetableConfigRequest config) {
        return ResponseEntity.ok(autoService.generateTimetable(config));
    }

    private void sortTimetables(List<Timetable> entries) {
        if (entries == null) {
            return;
        }
        entries.sort(
                Comparator.comparingInt((Timetable t) -> dayOrder(t.getDayOfWeek()))
                        .thenComparingInt(Timetable::getPeriodNumber)
        );
    }

    private int dayOrder(String dayOfWeek) {
        if (dayOfWeek == null) {
            return Integer.MAX_VALUE;
        }
        return switch (dayOfWeek.toUpperCase()) {
            case "MONDAY" -> 1;
            case "TUESDAY" -> 2;
            case "WEDNESDAY" -> 3;
            case "THURSDAY" -> 4;
            case "FRIDAY" -> 5;
            case "SATURDAY" -> 6;
            case "SUNDAY" -> 7;
            default -> Integer.MAX_VALUE - 1;
        };
    }
}
