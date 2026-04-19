package com.backend.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    public UserEntity getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
    }

    public UserEntity createUser(UserEntity newUser) {
        validateUniqueness(newUser, null);

        if (newUser.getRole() == null) {
            newUser.setRole(UserEntity.Role.CUSTOMER);
        }

        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

        return userRepository.save(newUser);
    }

    public UserEntity updateUser(UUID id, UserEntity updatedUser) {
        UserEntity existingUser = getUserById(id);

        validateUniqueness(updatedUser, id);

        existingUser.setName(updatedUser.getName());
        existingUser.setSurname(updatedUser.getSurname());
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setEmail(updatedUser.getEmail());
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        existingUser.setDateOfBirth(updatedUser.getDateOfBirth());
        existingUser.setAddress(updatedUser.getAddress());

        if (updatedUser.getRole() != null) {
            existingUser.setRole(updatedUser.getRole());
        }

        return userRepository.save(existingUser);
    }

    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id);
        }

        userRepository.deleteById(id);
    }

    private void validateUniqueness(UserEntity user, UUID currentUserId) {
        userRepository.findByUsername(user.getUsername()).ifPresent(existing -> {
            if (currentUserId == null || !existing.getID().equals(currentUserId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists: " + user.getUsername());
            }
        });

        userRepository.findByEmail(user.getEmail()).ifPresent(existing -> {
            if (currentUserId == null || !existing.getID().equals(currentUserId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists: " + user.getEmail());
            }
        });
    }
}


