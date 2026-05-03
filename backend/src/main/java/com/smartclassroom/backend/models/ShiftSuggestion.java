package com.smartclassroom.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "shift_suggestions")
public class ShiftSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "timetable_id", nullable = false)
    private Timetable timetable;

    @ManyToOne
    @JoinColumn(name = "original_teacher_id", nullable = false)
    private User originalTeacher;

    @ManyToOne
    @JoinColumn(name = "suggested_teacher_id", nullable = false)
    private User suggestedTeacher;

    @Enumerated(EnumType.STRING)
    private ShiftStatus status; // PENDING, APPROVED, REJECTED
}
