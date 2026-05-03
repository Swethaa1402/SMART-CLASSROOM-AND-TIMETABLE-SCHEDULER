package com.smartclassroom.backend.repository;

import com.smartclassroom.backend.models.Announcement;
import com.smartclassroom.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findAllByOrderByCreatedAtDesc();
    List<Announcement> findByPostedBy(User user);
}
