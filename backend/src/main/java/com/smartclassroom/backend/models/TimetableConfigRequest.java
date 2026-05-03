package com.smartclassroom.backend.models;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TimetableConfigRequest {

    private List<ClassInfo> classes;
    private List<StaffInfo> staff;
    private List<SubjectInfo> subjects;
    private BreakDetails breakDetails;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ClassInfo {
        private String name;
        private String roomNumber;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StaffInfo {
        private String name;
        private Long id; // Assuming we link by User ID
        private int maxHoursPerDay;
        private int maxHoursPerWeek;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SubjectInfo {
        private String name;
        private Long staffId; 
        private String assignedClass; // New field
        private int hoursPerWeek;
        private boolean isLab; // If true -> labDuration block required
        private int labDuration; // e.g. 2 or 3
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BreakDetails {
        private int snackBreakPeriod; // period number for snack break
        private int snackBreakDurationMinutes; // 15
        private int lunchBreakPeriod; // period number for lunch break
        private int lunchBreakDurationMinutes; // 45
        private int totalPeriodsPerDay; // 6
        private int periodDurationMinutes; // 60
    }
}
