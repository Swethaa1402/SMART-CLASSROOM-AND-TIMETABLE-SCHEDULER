package com.smartclassroom.backend.services;

import com.smartclassroom.backend.models.Timetable;
import com.smartclassroom.backend.models.User;
import com.smartclassroom.backend.repository.TimetableRepository;
import com.smartclassroom.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.smartclassroom.backend.models.TimetableConfigRequest;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TimetableAutoService {

    private final TimetableRepository timetableRepository;
    private final UserRepository userRepository;
    private final com.smartclassroom.backend.repository.ClassroomRepository classroomRepository;

    public String generateTimetable() {
        return "Not Supported. Please use frontend to pass config.";
    }

    public String generateTimetable(TimetableConfigRequest config) {
        if (config == null) {
            throw new RuntimeException("Timetable configuration is missing.");
        }
        if (config.getClasses() == null || config.getClasses().isEmpty()) {
            throw new RuntimeException("Add at least one class before generating the timetable.");
        }
        if (config.getStaff() == null || config.getStaff().isEmpty()) {
            throw new RuntimeException("Teacher constraints are missing. Add at least one teacher.");
        }
        if (config.getSubjects() == null || config.getSubjects().isEmpty()) {
            throw new RuntimeException("Add at least one subject before generating the timetable.");
        }

        for (TimetableConfigRequest.ClassInfo cls : config.getClasses()) {
            if (cls.getName() == null || cls.getName().trim().isEmpty()) {
                throw new RuntimeException("Every class must have a valid name.");
            }
            if (cls.getRoomNumber() == null || cls.getRoomNumber().trim().isEmpty()) {
                throw new RuntimeException("Class " + cls.getName() + " does not have a valid room number.");
            }
        }

        for (TimetableConfigRequest.SubjectInfo sub : config.getSubjects()) {
            if (sub.getName() == null || sub.getName().trim().isEmpty()) {
                throw new RuntimeException("Every subject must have a name.");
            }
            if (sub.getStaffId() == null || !userRepository.existsById(sub.getStaffId())) {
                throw new RuntimeException("Subject " + sub.getName() + " has an invalid or missing teacher ID.");
            }
            if (sub.getAssignedClass() == null || sub.getAssignedClass().trim().isEmpty()) {
                throw new RuntimeException("Subject " + sub.getName() + " is not assigned to a class.");
            }
            if (sub.getHoursPerWeek() <= 0) {
                throw new RuntimeException("Subject " + sub.getName() + " must have at least 1 hour per week.");
            }
            if (sub.isLab() && sub.getLabDuration() < 2) {
                throw new RuntimeException("Lab subject " + sub.getName() + " must have a labDuration of at least 2.");
            }
        }

        timetableRepository.deleteAll(); 

        List<String> days = List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY");
        
        int totalPeriods = config.getBreakDetails() != null ? config.getBreakDetails().getTotalPeriodsPerDay() : 6;
        int snackBreakIdx = config.getBreakDetails() != null ? config.getBreakDetails().getSnackBreakPeriod() - 1 : 2;
        int lunchBreakIdx = config.getBreakDetails() != null ? config.getBreakDetails().getLunchBreakPeriod() - 1 : 4;
        int periodMinutes = config.getBreakDetails() != null ? config.getBreakDetails().getPeriodDurationMinutes() : 60;
        int snackMinutes = config.getBreakDetails() != null ? config.getBreakDetails().getSnackBreakDurationMinutes() : 15;
        int lunchMinutes = config.getBreakDetails() != null ? config.getBreakDetails().getLunchBreakDurationMinutes() : 45;

        if (totalPeriods <= 0) {
            throw new RuntimeException("Total periods per day must be greater than zero.");
        }
        if (snackBreakIdx < 0 || snackBreakIdx >= totalPeriods || lunchBreakIdx < 0 || lunchBreakIdx >= totalPeriods) {
            throw new RuntimeException("Break periods must be within the daily timetable range.");
        }

        List<String[]> timeSlots = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        LocalTime cursor = LocalTime.of(9, 0);
        for (int i = 0; i < totalPeriods; i++) {
            LocalTime start = cursor;
            LocalTime end = start.plusMinutes(periodMinutes);
            timeSlots.add(new String[]{start.format(formatter), end.format(formatter)});
            cursor = end;
            if (i == snackBreakIdx) {
                cursor = cursor.plusMinutes(snackMinutes);
            }
            if (i == lunchBreakIdx) {
                cursor = cursor.plusMinutes(lunchMinutes);
            }
        }

        Map<String, TimetableConfigRequest.SubjectInfo[][]> classSchedules = new HashMap<>();
        Map<String, String> classRooms = new HashMap<>(); 
        
        Map<String, boolean[][]> roomSchedules = new HashMap<>(); 

        for (TimetableConfigRequest.ClassInfo cls : config.getClasses()) {
            classSchedules.put(cls.getName(), new TimetableConfigRequest.SubjectInfo[6][totalPeriods]);
            classRooms.put(cls.getName(), cls.getRoomNumber());
            if (!roomSchedules.containsKey(cls.getRoomNumber())) {
                roomSchedules.put(cls.getRoomNumber(), new boolean[6][totalPeriods]);
            }
        }

        Map<Long, boolean[][]> teacherSchedules = new HashMap<>();
        Map<Long, Integer> teacherWeeklyHours = new HashMap<>();
        Map<Long, int[]> teacherDailyHours = new HashMap<>();
        Map<Long, TimetableConfigRequest.StaffInfo> staffMap = new HashMap<>();

        for (TimetableConfigRequest.StaffInfo staff : config.getStaff()) {
            teacherSchedules.put(staff.getId(), new boolean[6][totalPeriods]);
            teacherWeeklyHours.put(staff.getId(), 0);
            teacherDailyHours.put(staff.getId(), new int[6]);
            staffMap.put(staff.getId(), staff);
        }

        List<Job> labJobs = new ArrayList<>();
        List<Job> theoryJobs = new ArrayList<>();

        for (TimetableConfigRequest.SubjectInfo sub : config.getSubjects()) {
            TimetableConfigRequest.ClassInfo cls = null;
            for (TimetableConfigRequest.ClassInfo c : config.getClasses()) {
                if (c.getName().equals(sub.getAssignedClass())) {
                    cls = c;
                    break;
                }
            }
            if (cls == null) continue; 

            if (sub.isLab()) {
                labJobs.add(new Job(cls, sub, sub.getHoursPerWeek()));
            } else {
                theoryJobs.add(new Job(cls, sub, sub.getHoursPerWeek()));
            }
        }

        // Sort for deterministic generation
        labJobs.sort(Comparator.comparing((Job j) -> j.cls.getName()).thenComparing(j -> j.sub.getName()));
        theoryJobs.sort(Comparator.comparing((Job j) -> j.cls.getName()).thenComparing(j -> j.sub.getName()));

        List<String> schedulingErrors = new ArrayList<>();

        for (Job job : labJobs) {
            scheduleLab(job, classSchedules, teacherSchedules, roomSchedules, teacherDailyHours, teacherWeeklyHours, 
                staffMap, classRooms, snackBreakIdx, lunchBreakIdx, totalPeriods, schedulingErrors);
        }

        for (Job job : theoryJobs) {
            scheduleTheory(job, classSchedules, teacherSchedules, roomSchedules, teacherDailyHours, teacherWeeklyHours, 
                staffMap, classRooms, snackBreakIdx, lunchBreakIdx, totalPeriods, schedulingErrors);
        }

        if (!schedulingErrors.isEmpty()) {
            timetableRepository.deleteAll();
            throw new RuntimeException(String.join(" ", schedulingErrors));
        }

        List<Timetable> entriesToSave = new ArrayList<>();
        for (String className : classSchedules.keySet()) {
            TimetableConfigRequest.SubjectInfo[][] grid = classSchedules.get(className);
            for (int day = 0; day < 6; day++) {
                
                for (int p = 0; p < totalPeriods; p++) {
                    if (p == snackBreakIdx) {
                        entriesToSave.add(Timetable.builder()
                            .subject("SNACK BREAK")
                            .dayOfWeek(days.get(day))
                            .periodNumber(p + 1)
                            .startTime(timeSlots.get(p)[0])
                            .endTime(timeSlots.get(p)[1])
                            .room("-")
                            .className(className)
                            .teacher(null)
                            .build());
                    } else if (p == lunchBreakIdx) {
                        entriesToSave.add(Timetable.builder()
                            .subject("LUNCH BREAK")
                            .dayOfWeek(days.get(day))
                            .periodNumber(p + 1)
                            .startTime(timeSlots.get(p)[0])
                            .endTime(timeSlots.get(p)[1])
                            .room("-")
                            .className(className)
                            .teacher(null)
                            .build());
                    } else {
                        TimetableConfigRequest.SubjectInfo sub = grid[day][p];
                        if (sub != null) {
                            User teacher = userRepository
                                    .findById(sub.getStaffId())
                                    .orElse(null);

                            Timetable entry = Timetable.builder()
                                .subject(sub.getName())
                                .dayOfWeek(days.get(day))
                                .periodNumber(p + 1)
                                .startTime(timeSlots.get(p)[0])
                                .endTime(timeSlots.get(p)[1])
                                .room(classRooms.get(className))
                                .className(className)
                                .teacher(teacher)
                                .build();

                            entriesToSave.add(entry);
                        }
                    }
                }
            }
        }
        
        if (entriesToSave.stream().noneMatch(entry -> entry.getTeacher() != null)) {
            throw new RuntimeException("Timetable generation did not assign any teacher slots. Please check class rooms, subjects, and teacher constraints.");
        }

        entriesToSave.sort(java.util.Comparator.comparing(Timetable::getClassName)
                .thenComparing(Timetable::getDayOfWeek)
                .thenComparing(Timetable::getPeriodNumber));
        timetableRepository.saveAll(entriesToSave);

        long teachingSlots = entriesToSave.stream().filter(entry -> entry.getTeacher() != null).count();
        return "Timetable generated successfully with " + teachingSlots + " scheduled classes.";
    }

    private void scheduleLab(Job job, Map<String, TimetableConfigRequest.SubjectInfo[][]> classSchedules,
                             Map<Long, boolean[][]> teacherSchedules, Map<String, boolean[][]> roomSchedules,
                             Map<Long, int[]> teacherDailyHours, Map<Long, Integer> teacherWeeklyHours, 
                             Map<Long, TimetableConfigRequest.StaffInfo> staffMap, Map<String, String> classRooms,
                             int snackIdx, int lunchIdx, int totalPeriods, List<String> schedulingErrors) {
        
        TimetableConfigRequest.SubjectInfo[][] cSchedule = classSchedules.get(job.cls.getName());
        boolean[][] tSchedule = teacherSchedules.get(job.sub.getStaffId());
        boolean[][] rSchedule = roomSchedules.get(classRooms.get(job.cls.getName()));
        int[] tDaily = teacherDailyHours.get(job.sub.getStaffId());
        int maxD = staffMap.get(job.sub.getStaffId()).getMaxHoursPerDay();
        int maxW = staffMap.get(job.sub.getStaffId()).getMaxHoursPerWeek();

        int length = job.sub.getLabDuration();

        int remainingBlocks = job.hoursRequired / length; 
        if (job.hoursRequired % length != 0) remainingBlocks++; 

        for (int b = 0; b < remainingBlocks; b++) {
            boolean scheduled = false;
            for (int day = 0; day < 6 && !scheduled; day++) {
                boolean labAlreadyOnDay = false;
                for (int p = 0; p < totalPeriods; p++) {
                    if (cSchedule[day][p] != null && cSchedule[day][p].isLab()) {
                        labAlreadyOnDay = true;
                        break;
                    }
                }
                if (labAlreadyOnDay) continue;

                for (int startP = 0; startP <= totalPeriods - length; startP++) {
                    if (tDaily[day] + length > maxD) continue;
                    if (teacherWeeklyHours.get(job.sub.getStaffId()) + length > maxW) continue;
                    
                    boolean crossesBreak = false;
                    for (int i = startP; i < startP + length; i++) {
                        if (i == snackIdx || i == lunchIdx) {
                            crossesBreak = true;
                            break;
                        }
                    }
                    if (crossesBreak) continue;

                    boolean overlap = false;
                    for (int p = startP; p < startP + length; p++) {
                        if (cSchedule[day][p] != null || tSchedule[day][p] || rSchedule[day][p]) {
                            overlap = true;
                            break;
                        }
                    }
                    if (overlap) continue;

                    for (int p = startP; p < startP + length; p++) {
                        cSchedule[day][p] = job.sub;
                        tSchedule[day][p] = true;
                        rSchedule[day][p] = true;
                    }
                    tDaily[day] += length;
                    teacherWeeklyHours.put(job.sub.getStaffId(), teacherWeeklyHours.get(job.sub.getStaffId()) + length);
                    scheduled = true;
                    break;
                }
            }
            if (!scheduled) {
                schedulingErrors.add("Could not schedule lab subject " + job.sub.getName() + " for class " + job.cls.getName() + ".");
                return;
            }
        }
    }


    private void scheduleTheory(Job job, Map<String, TimetableConfigRequest.SubjectInfo[][]> classSchedules,
                                Map<Long, boolean[][]> teacherSchedules, Map<String, boolean[][]> roomSchedules,
                                Map<Long, int[]> teacherDailyHours, Map<Long, Integer> teacherWeeklyHours, 
                                Map<Long, TimetableConfigRequest.StaffInfo> staffMap, Map<String, String> classRooms,
                                int snackIdx, int lunchIdx, int totalPeriods, List<String> schedulingErrors) {
                                    
        TimetableConfigRequest.SubjectInfo[][] cSchedule = classSchedules.get(job.cls.getName());
        boolean[][] tSchedule = teacherSchedules.get(job.sub.getStaffId());
        boolean[][] rSchedule = roomSchedules.get(classRooms.get(job.cls.getName()));
        int[] tDaily = teacherDailyHours.get(job.sub.getStaffId());
        int maxD = staffMap.get(job.sub.getStaffId()).getMaxHoursPerDay();
        int maxW = staffMap.get(job.sub.getStaffId()).getMaxHoursPerWeek();

        int remainingHours = job.hoursRequired;

        for (int day = 0; day < 6 && remainingHours > 0; day++) {
            boolean alreadyScheduledToday = false;
            for (int p = 0; p < totalPeriods; p++) {
                if (cSchedule[day][p] != null && cSchedule[day][p].getName().equals(job.sub.getName())) {
                    alreadyScheduledToday = true;
                    break;
                }
            }
            if (alreadyScheduledToday) continue;

            for (int p = 0; p < totalPeriods; p++) {
                if (p == snackIdx || p == lunchIdx) continue;
                if (cSchedule[day][p] == null && !tSchedule[day][p] && !rSchedule[day][p]) {
                    if (tDaily[day] + 1 <= maxD && teacherWeeklyHours.get(job.sub.getStaffId()) + 1 <= maxW) {
                        
                        cSchedule[day][p] = job.sub;
                        tSchedule[day][p] = true;
                        rSchedule[day][p] = true;
                        tDaily[day]++;
                        teacherWeeklyHours.put(job.sub.getStaffId(), teacherWeeklyHours.get(job.sub.getStaffId()) + 1);
                        remainingHours--;
                        break; 
                    }
                }
            }
        }

        if (remainingHours > 0) {
            schedulingErrors.add("Could not schedule all " + job.sub.getHoursPerWeek() + " hours for subject " + job.sub.getName() + " in class " + job.cls.getName() + ".");
        }
    }

    private static class Job {
        TimetableConfigRequest.ClassInfo cls;
        TimetableConfigRequest.SubjectInfo sub;
        int hoursRequired;
        
        Job(TimetableConfigRequest.ClassInfo cls, TimetableConfigRequest.SubjectInfo sub, int hoursRequired) {
            this.cls = cls;
            this.sub = sub;
            this.hoursRequired = hoursRequired;
        }
    }
}
