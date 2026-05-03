package com.smartclassroom.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "leave_requests")
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @NotFound(action = NotFoundAction.IGNORE)
    private User teacher;

    @Column(nullable = false)
    private String reason;

    @JsonIgnore
    @Column(name = "date", nullable = false)
    private LocalDate leaveDate;

    @Transient
    private LocalDate fromDate;

    @Transient
    private LocalDate toDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LeaveStatus status = LeaveStatus.PENDING;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum LeaveStatus {
        PENDING,
        APPROVED,
        DECLINED
    }

    private String replacementTeacher;

    public LocalDate getFromDate() {
        return fromDate != null ? fromDate : leaveDate;
    }

    public void setFromDate(LocalDate fromDate) {
        this.fromDate = fromDate;
        this.leaveDate = fromDate;
        if (this.toDate == null) {
            this.toDate = fromDate;
        }
    }

    public LocalDate getToDate() {
        return toDate != null ? toDate : leaveDate;
    }

    public void setToDate(LocalDate toDate) {
        this.toDate = toDate;
        if (this.leaveDate == null) {
            this.leaveDate = toDate;
        }
    }

    @PrePersist
    @PreUpdate
    public void syncDates() {
        if (leaveDate == null) {
            leaveDate = fromDate != null ? fromDate : toDate;
        }
        if (fromDate == null) {
            fromDate = leaveDate;
        }
        if (toDate == null) {
            toDate = leaveDate;
        }
    }
}
