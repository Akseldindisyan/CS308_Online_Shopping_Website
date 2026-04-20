package com.backend.backend.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.backend.api.dto.LoginRequestDTO;
import com.backend.backend.api.dto.LoginResponseDTO;
import com.backend.backend.api.dto.RegisterRequestDTO;
import com.backend.backend.api.exception.BadRequestException;
import com.backend.backend.api.exception.ConflictException;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.UserRepository;
import com.backend.backend.security.AppUserPrincipal;
import com.backend.backend.security.JwtService;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponseDTO login(LoginRequestDTO request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));

            Object principalObj = authentication.getPrincipal();
            if (!(principalObj instanceof AppUserPrincipal)) {
                throw new BadRequestException("INVALID_CREDENTIALS", "Username or password is incorrect");
            }
            AppUserPrincipal principal = (AppUserPrincipal) principalObj;
            String token = jwtService.generateToken(principal);

            return new LoginResponseDTO(token);
        } catch (AuthenticationException ex) {
            throw new BadRequestException("INVALID_CREDENTIALS", "Username or password is incorrect");
        }
    }

    public LoginResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("USERNAME_EXISTS", "Username already exists: " + request.username());
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("EMAIL_EXISTS", "Email already exists: " + request.email());
        }

        UserEntity newUser = new UserEntity(
                request.name(),
                request.surname(),
                request.username(),
                request.email(),
                passwordEncoder.encode(request.password()),
                request.dateOfBirth(),
                UserEntity.Role.CUSTOMER);

        UserEntity savedUser = userRepository.save(newUser);
        String token = jwtService.generateToken(new AppUserPrincipal(savedUser));
        return new LoginResponseDTO(token);
    }
}


