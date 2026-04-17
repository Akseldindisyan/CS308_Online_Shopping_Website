package com.backend.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.backend.backend.persistence.entity.AddressEntity;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.UserRepository;

import jakarta.transaction.Transactional;

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
                UserEntity.Role.CUSTOMER));
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
                UserEntity.Role.SALES_MANAGER));

        assertTrue(userRepository.findById(created.getID()).isPresent());
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
                UserEntity.Role.PRODUCT_MANAGER);

        UserEntity updated = userService.updateUser(existing.getID(), updatePayload);

        assertEquals("Janet", updated.getName());
        assertEquals("janet", updated.getUsername());
        assertEquals(UserEntity.Role.PRODUCT_MANAGER, updated.getRole());
    }

    @Test
    void deleteUser_removesUser() {
        UserEntity existing = userRepository.findByUsername("jane").orElseThrow();

        userService.deleteUser(existing.getID());

        assertTrue(userRepository.findById(existing.getID()).isEmpty());
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
                        UserEntity.Role.CUSTOMER)));

        assertEquals(409, ex.getStatusCode().value());
    }

    @Test
    void CheckAuthentication(){    
        Optional<UserEntity> user = userRepository.findByEmail("jane@example.com");

        Boolean res = userService.authenticate(user.orElse(null).getEmail(), "pass1");
        assertEquals(true, res);

    }

    @Transactional
    @Test
    void checkAddAddress(){
        UserEntity updatePayload = new UserEntity(
                "Janet",
                "Doe",
                "janet",
                "janet@example.com",
                "newpass",
                LocalDate.of(1998, 4, 15),
                UserEntity.Role.PRODUCT_MANAGER);

        AddressEntity address = new AddressEntity("Istanbul", "A", "11111", "Turkey");

        userService.addAddress(updatePayload, address);

        Optional<UserEntity> newVersion = userRepository.findByEmail(updatePayload.getEmail());
        List<AddressEntity> addressList = newVersion.orElseGet(null).getAddress();
        assertEquals(address.getCity(), addressList.get(0).getCity());
    }
}

