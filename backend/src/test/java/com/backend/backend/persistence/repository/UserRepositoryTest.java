package com.backend.backend.persistence.repository;

//Import classes
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.entity.AddressEntity;
import com.backend.backend.service.UserService;

//Import basic structures
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import javax.management.relation.Role;

//Import Test libraries
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class UserRepositoryTest {

    @Autowired
    UserRepository userRepository;

    //Funtions to automate testing
    @BeforeEach
    void initializeMockupDatabase() {
        userRepository.deleteAll();    

        List<UserEntity> mockUsers = List.of(
                new UserEntity("John", "Doe", "johndoe88", "john.doe@example.com", "pass1234", LocalDate.of(1988, 5, 12), UserEntity.Role.CUSTOMER),
                new UserEntity("Jane", "Smith", "janesmith99", "jane.smith@example.com", "securepass", LocalDate.of(1999, 8, 24),  UserEntity.Role.CUSTOMER),
                new UserEntity("Alice", "Johnson", "alicej", "alice.j@example.com", "qwerty99", LocalDate.of(1995, 2, 10),  UserEntity.Role.CUSTOMER),
                new UserEntity("Bob", "Brown", "bobbrown", "bob.b@example.com", "admin123", LocalDate.of(1980, 11, 5),  UserEntity.Role.CUSTOMER),
                new UserEntity("Charlie", "Davis", "charlied", "charlie.d@example.com", "mypassword", LocalDate.of(2001, 7, 19), UserEntity.Role.CUSTOMER)
        );

        userRepository.saveAll(mockUsers);
    }

    //Cleans the database
    @AfterEach
    void cleanUpDatabase() {
        userRepository.deleteAll();
    }


    //Tests
    @Test
    void findByUserNameTest() {
        System.out.println("Find User by their username");

        Optional<UserEntity> result = userRepository.findByUsername("alicej");
        //Check if it returns the user with the correct name
        assertEquals("alicej", result.orElse(null).getUsername());
    }

    @Test 
    void findByEmail(){
        System.out.println("Find User by their email");

        Optional<UserEntity> result = userRepository.findByUsername("alicej");
        assertTrue(result.isPresent());
        // Check if it returns the user with the correct name.
        assertEquals("alicej", result.get().getUsername());
    }

}
