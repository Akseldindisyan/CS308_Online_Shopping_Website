package com.backend.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.UserRepository;

@SpringBootTest
public class UserServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        userRepository.save(new UserEntity(
                "Jane",
                "Doe",
                "jane",
                "jane@example.com",
                encoder.encode("pass1"),
                LocalDate.of(1998, 4, 15),
                UserEntity.Role.CUSTOMER, "Turkey", "Istanbul", "A", "11111",1000));
    }

    @Test
    void createUser_persistsUser() {
        UserEntity created = userService.createUser(new UserEntity(
                "John",
                "Smith",
                "john",
                "john@example.com",
                "pass2",
                LocalDate.of(1995, 1, 1),
                UserEntity.Role.SALES_MANAGER, "Turkey", "Istanbul", "A", "11111",1000));

        assertTrue(userRepository.findById(created.getId()).isPresent());
        assertEquals("john", created.getUsername());
    }

    @Test
    void updateUser_updatesExistingUser() {
        UserEntity existing = userRepository.findByUsername("jane").orElseThrow();

        UserEntity updatePayload = new UserEntity(
                "Janet",
                "Doe",
                "janet",
                "janet@example.com",
                "newpass",
                LocalDate.of(1998, 4, 15),
                UserEntity.Role.PRODUCT_MANAGER, "Turkey", "Istanbul", "A", "11111",1000);

        UserEntity updated = userService.updateUser(existing.getId(), updatePayload);

        assertEquals("Janet", updated.getName());
        assertEquals("janet", updated.getUsername());
        assertEquals(UserEntity.Role.PRODUCT_MANAGER, updated.getRole());
    }

    @Test
    void deleteUser_removesUser() {
        UserEntity existing = userRepository.findByUsername("jane").orElseThrow();

        userService.deleteUser(existing.getId());

        assertTrue(userRepository.findById(existing.getId()).isEmpty());
    }

    @Test
    void createUser_withDuplicateUsername_throwsConflict() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.createUser(new UserEntity(
                        "Other",
                        "User",
                        "jane",
                        "other@example.com",
                        "pass3",
                        LocalDate.of(1990, 2, 2),
                        UserEntity.Role.CUSTOMER, "Turkey", "Istanbul", "A", "11111",1000)));

        assertEquals(409, ex.getStatusCode().value());
    }

    @Test
    void CheckAuthentication(){    
        Optional<UserEntity> user = userRepository.findByEmail("jane@example.com");

        Boolean res = userService.authenticate(user.orElse(null).getEmail(), "pass1");
        assertEquals(true, res);

    }
}

