package com.smartclassroom.backend.repository;

import com.smartclassroom.backend.models.User;
import com.smartclassroom.backend.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByClassName(String className);

    List<User> findByClassNameAndRole(String className, Role role);
    
    List<User> findByRole(Role role);

}