package com.backend.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.backend.backend.api.dto.LoginResponseDTO;
import com.backend.backend.api.dto.RegisterRequestDTO;
import com.backend.backend.api.exception.ConflictException;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.UserRepository;
import com.backend.backend.security.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private org.springframework.security.authentication.AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerCreatesCustomerAndReturnsToken() {
        RegisterRequestDTO request = new RegisterRequestDTO(
                "Jane",
                "Doe",
                "jane",
                "jane@example.com",
                "password123",
                LocalDate.of(1999, 1, 1),
                "Ankara"
        );

        when(userRepository.existsByUsername("jane")).thenReturn(false);
        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed-password");
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> {
            UserEntity entity = invocation.getArgument(0);
            entity.setId(UUID.randomUUID());
            return entity;
        });
        when(jwtService.generateToken(any())).thenReturn("jwt-token");

        LoginResponseDTO response = authService.register(request);

        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository).save(captor.capture());

        UserEntity savedUser = captor.getValue();
        assertEquals(UserEntity.Role.CUSTOMER, savedUser.getRole());
        assertEquals("hashed-password", savedUser.getPassword());
        assertEquals("jwt-token", response.token());
    }

    @Test
    void registerThrowsConflictWhenUsernameExists() {
        RegisterRequestDTO request = new RegisterRequestDTO(
                "Jane",
                "Doe",
                "jane",
                "jane@example.com",
                "password123",
                LocalDate.of(1999, 1, 1),
                "Ankara"
        );

        when(userRepository.existsByUsername("jane")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(request));
    }

    @Test
    void registerAllowsNullDateOfBirthAndAddress() {
        RegisterRequestDTO request = new RegisterRequestDTO(
                "John",
                "Doe",
                "john",
                "john@example.com",
                "password123",
                null,
                null
        );

        when(userRepository.existsByUsername("john")).thenReturn(false);
        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed-password");
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> {
            UserEntity entity = invocation.getArgument(0);
            entity.setId(UUID.randomUUID());
            return entity;
        });
        when(jwtService.generateToken(any())).thenReturn("jwt-token");

        LoginResponseDTO response = authService.register(request);

        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository).save(captor.capture());

        UserEntity savedUser = captor.getValue();
        assertNull(savedUser.getDateOfBirth());
        assertTrue(savedUser.getAddress().isEmpty());
        assertEquals("jwt-token", response.token());
    }
}

