package com.smartclassroom.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardResponse {

    private int totalPresent;
    private int totalAbsent;
    private double attendancePercentage;
    private int streak;

}