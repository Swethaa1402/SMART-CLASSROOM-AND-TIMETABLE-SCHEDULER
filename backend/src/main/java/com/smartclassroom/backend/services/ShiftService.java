package com.smartclassroom.backend.services;

import com.smartclassroom.backend.models.*;
import com.smartclassroom.backend.repository.ShiftSuggestionRepository;
import com.smartclassroom.backend.repository.TimetableRepository;
import com.smartclassroom.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShiftService {

    private final ShiftSuggestionRepository shiftSuggestionRepository;
    private final TimetableRepository timetableRepository;
    private final UserRepository userRepository;

    public ShiftSuggestion createShiftSuggestion(Long timetableId, Long originalTeacherId) {
        Timetable timetable = timetableRepository.findById(timetableId)
                .orElseThrow(() -> new RuntimeException("Timetable not found"));
        
        User originalTeacher = userRepository.findById(originalTeacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Logic to find a free teacher
        // 1. Get all teachers
        // 2. Filter out those who have a class at the same time (day + start/end time)
        // This requires complex querying. For simplicity, we'll pick the first available teacher.

        List<User> allTeachers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.TEACHER && !u.getId().equals(originalTeacherId))
                .toList();

        User suggestedTeacher = null;

        for (User teacher : allTeachers) {
            boolean isBusy = timetableRepository.existsByTeacherAndDayOfWeekAndStartTime(
                    teacher, timetable.getDayOfWeek(), timetable.getStartTime());
            
            if (!isBusy) {
                suggestedTeacher = teacher;
                break;
            }
        }

        if (suggestedTeacher == null) {
            throw new RuntimeException("No free teacher found for this slot");
        }

        ShiftSuggestion suggestion = ShiftSuggestion.builder()
                .timetable(timetable)
                .originalTeacher(originalTeacher)
                .suggestedTeacher(suggestedTeacher)
                .status(ShiftStatus.PENDING)
                .build();

        return shiftSuggestionRepository.save(suggestion);
    }

    public List<ShiftSuggestion> getPendingSuggestions() {
        return shiftSuggestionRepository.findByStatus(ShiftStatus.PENDING);
    }

    public ShiftSuggestion approveShift(Long suggestionId) {
        ShiftSuggestion suggestion = shiftSuggestionRepository.findById(suggestionId)
                .orElseThrow(() -> new RuntimeException("Suggestion not found"));
        
        suggestion.setStatus(ShiftStatus.APPROVED);
        
        // Update the actual timetable
        Timetable timetable = suggestion.getTimetable();
        timetable.setTeacher(suggestion.getSuggestedTeacher());
        timetableRepository.save(timetable);

        return shiftSuggestionRepository.save(suggestion);
    }
    
    public ShiftSuggestion rejectShift(Long suggestionId) {
        ShiftSuggestion suggestion = shiftSuggestionRepository.findById(suggestionId)
                .orElseThrow(() -> new RuntimeException("Suggestion not found"));
        
        suggestion.setStatus(ShiftStatus.REJECTED);
        return shiftSuggestionRepository.save(suggestion);
    }
    
    public List<ShiftSuggestion> getTeacherShifts(Long teacherId) {
        return shiftSuggestionRepository.findByOriginalTeacherId(teacherId);
    }

    public List<ShiftSuggestion> getIncomingShifts(Long teacherId) {
        return shiftSuggestionRepository.findBySuggestedTeacherId(teacherId);
    }
}
