package com.smartclassroom.backend.services;

import com.smartclassroom.backend.models.Note;
import com.smartclassroom.backend.models.User;
import com.smartclassroom.backend.repository.NoteRepository;
import com.smartclassroom.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    public Note createNote(Long userId, String title, String content) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Note note = Note.builder()
                .user(user)
                .title(title)
                .content(content)
                .build();
        
        return noteRepository.save(note);
    }

    public List<Note> getUserNotes(Long userId) {
        return noteRepository.findByUserId(userId);
    }

    public void deleteNote(Long noteId) {
        noteRepository.deleteById(noteId);
    }

    public Note updateNote(Long noteId, String title, String content) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        note.setTitle(title);
        note.setContent(content);
        return noteRepository.save(note);
    }
}
