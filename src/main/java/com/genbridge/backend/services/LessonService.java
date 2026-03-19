package com.genbridge.backend.services;

import com.genbridge.backend.dto.LessonRequest;
import com.genbridge.backend.entity.Lesson;
import com.genbridge.backend.repository.LessonRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class LessonService {

    private final LessonRepository lessonRepository;

    public LessonService(LessonRepository lessonRepository) {
        this.lessonRepository = lessonRepository;
    }

    public List<Lesson> getPublishedLessons() {
        return lessonRepository.findByPublishedTrue();
    }

    public Lesson getPublishedLessonById(Long id) {
        return lessonRepository.findByIdAndPublishedTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
    }

    public List<Lesson> getAllLessons() {
        return lessonRepository.findAll();
    }

    public Lesson createLesson(LessonRequest request) {
        Lesson lesson = new Lesson();
        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        lesson.setDifficulty(request.getDifficulty());
        lesson.setObjective(request.getObjective());
        return lessonRepository.save(lesson);
    }

    public Lesson updateLesson(Long id, LessonRequest request) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        lesson.setDifficulty(request.getDifficulty());
        lesson.setObjective(request.getObjective());
        lesson.setUpdatedAt(LocalDateTime.now());
        return lessonRepository.save(lesson);
    }

    public Lesson togglePublish(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        lesson.setPublished(!lesson.isPublished());
        lesson.setUpdatedAt(LocalDateTime.now());
        return lessonRepository.save(lesson);
    }

    public void deleteLesson(Long id) {
        if (!lessonRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found");
        }
        lessonRepository.deleteById(id);
    }
}
