package com.smartclassroom.backend.services;

import com.smartclassroom.backend.models.Announcement;
import com.smartclassroom.backend.models.User;
import com.smartclassroom.backend.repository.AnnouncementRepository;
import com.smartclassroom.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    public Announcement createAnnouncement(Long userId, String title, String content) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
        
        Announcement announcement = Announcement.builder()
                .title(title)
                .message(content)
                .postedBy(user)
                .build();
        
        return announcementRepository.save(announcement);
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }

    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }
}
