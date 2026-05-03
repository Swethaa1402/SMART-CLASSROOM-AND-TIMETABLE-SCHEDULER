package com.smartclassroom.backend.models;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "announcements")
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "content", nullable = false, length = 2000)
    @JsonAlias("content")
    private String message;

    @JsonIgnore
    @Column(name = "message", nullable = false, length = 2000)
    private String legacyMessage;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // Optional fields kept for compatibility or future use
    private String targetAudience; 

    @ManyToOne
    @JoinColumn(name = "posted_by", nullable = false)
    @JsonIgnoreProperties({"password", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "username"})
    private User postedBy;

    @Transient
    public String getContent() {
        return message;
    }

    public void setContent(String content) {
        this.message = content;
    }

    @PrePersist
    @PreUpdate
    public void syncLegacyColumns() {
        if (message == null && legacyMessage != null) {
            message = legacyMessage;
        }
        legacyMessage = message;
    }
}
