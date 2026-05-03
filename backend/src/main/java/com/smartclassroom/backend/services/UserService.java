package com.smartclassroom.backend.services;

import com.smartclassroom.backend.models.Role;
import com.smartclassroom.backend.models.User;
import com.smartclassroom.backend.models.Announcement;
import com.smartclassroom.backend.models.Classroom;
import com.smartclassroom.backend.models.Timetable;
import com.smartclassroom.backend.repository.AnnouncementRepository;
import com.smartclassroom.backend.repository.AttendanceRepository;
import com.smartclassroom.backend.repository.ClassroomRepository;
import com.smartclassroom.backend.repository.LeaveRepository;
import com.smartclassroom.backend.repository.NoteRepository;
import com.smartclassroom.backend.repository.ShiftSuggestionRepository;
import com.smartclassroom.backend.repository.StreakRepository;
import com.smartclassroom.backend.repository.TimetableRepository;
import com.smartclassroom.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TimetableRepository timetableRepository;
    private final AnnouncementRepository announcementRepository;
    private final ClassroomRepository classroomRepository;
    private final LeaveRepository leaveRepository;
    private final NoteRepository noteRepository;
    private final ShiftSuggestionRepository shiftSuggestionRepository;
    private final AttendanceRepository attendanceRepository;
    private final StreakRepository streakRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    public User enableUser(Long id, boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(enabled);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Timetable> teacherTimetables = timetableRepository.findByTeacherId(id);
        for (Timetable timetable : teacherTimetables) {
            timetable.setTeacher(null);
        }
        if (!teacherTimetables.isEmpty()) {
            timetableRepository.saveAll(teacherTimetables);
        }

        List<Announcement> announcements = announcementRepository.findByPostedBy(user);
        for (Announcement announcement : announcements) {
            announcement.setPostedBy(null);
        }
        if (!announcements.isEmpty()) {
            announcementRepository.saveAll(announcements);
        }

        List<Classroom> classrooms = classroomRepository.findByStudentsContains(user);
        for (Classroom classroom : classrooms) {
            classroom.getStudents().remove(user);
        }
        if (!classrooms.isEmpty()) {
            classroomRepository.saveAll(classrooms);
        }

        classroomRepository.deleteAll(classroomRepository.findByTeacherId(id));
        leaveRepository.deleteByUserId(id);
        shiftSuggestionRepository.deleteByOriginalTeacherIdOrSuggestedTeacherId(id, id);
        noteRepository.deleteByUserId(id);
        attendanceRepository.deleteByStudentId(id);
        streakRepository.deleteByStudentId(id);

        userRepository.delete(user);
    }

    public List<User> getUsersByClassNameAndRole(String className, Role role) {
        return userRepository.findByClassNameAndRole(className, role);
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }
}
