package com.smartclassroom.backend.services;

import com.smartclassroom.backend.models.*;
import com.smartclassroom.backend.repository.TimetableRepository;
import com.smartclassroom.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AITimetableService {

    private final TimetableRepository timetableRepository;
    private final UserRepository userRepository;

    public void generateSmartTimetable(String className) {

        timetableRepository.deleteAll();

        List<User> teachers =
                userRepository.findAll().stream()
                        .filter(t -> t.getRole() == Role.TEACHER)
                        .toList();

        if(teachers.isEmpty()){
            throw new RuntimeException("No teachers found");
        }

        List<String> subjects = Arrays.asList(
                "Java",
                "DBMS",
                "AI",
                "Maths",
                "Web",
                "Python"
        );

        List<String> days = Arrays.asList(
                "MONDAY",
                "TUESDAY",
                "WEDNESDAY",
                "THURSDAY",
                "FRIDAY"
        );

        List<String> times = Arrays.asList(
                "09:00",
                "10:00",
                "11:00",
                "12:00",
                "02:00"
        );

        Random random = new Random();

        for(String day : days){

            for(String time : times){

                User teacher =
                        teachers.get(random.nextInt(teachers.size()));

                String subject =
                        subjects.get(random.nextInt(subjects.size()));

                Timetable timetable =
                        Timetable.builder()
                                .subject(subject)
                                .dayOfWeek(day)
                                .startTime(time)
                                .endTime("1hr")
                                .room("Room-"+random.nextInt(10))
                                .className(className)
                                .teacher(teacher)
                                .build();

                timetableRepository.save(timetable);

            }
        }

    }
}