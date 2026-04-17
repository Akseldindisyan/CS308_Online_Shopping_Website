package com.backend.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.backend.backend.persistence.entity.AddressEntity;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
        String hashPassword = encoder.encode(newUser.getPassword());
        newUser.setPassword(hashPassword);

        if (newUser.getRole() == null) {
            newUser.setRole(UserEntity.Role.CUSTOMER);
        }

        return userRepository.save(newUser);
    }

    public UserEntity updateUser(UUID id, UserEntity updatedUser) {
        UserEntity existingUser = getUserById(id);
        String hashPassword = encoder.encode(updatedUser.getPassword());

        validateUniqueness(updatedUser, id);

        existingUser.setName(updatedUser.getName());
        existingUser.setSurname(updatedUser.getSurname());
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPassword(hashPassword);
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
            if (currentUserId == null || !existing.getId().equals(currentUserId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists: " + user.getUsername());
            }
        });

        userRepository.findByEmail(user.getEmail()).ifPresent(existing -> {
            if (currentUserId == null || !existing.getId().equals(currentUserId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists: " + user.getEmail());
            }
        });
    }

    public Boolean authenticate(String email, String password){
        UserEntity user = null;
        try {
            user = userRepository.findByEmail(email).orElseThrow(() -> new Exception("Incorrect email or password!"));
        }
        catch(Exception e){
            System.out.println("Error: " + e.getMessage());
            return false;
        }

        String userPassword = user.getPassword();

        try {
            if(encoder.matches(password, userPassword) == true){
                return true;
            }
            throw new Exception("Incorrect email or password!!!!!!!");
        }
        catch(Exception e){
            System.out.println("Error: " + e.getMessage());
            return false;
        }

    }

    public UserEntity addAddress(UserEntity user, AddressEntity address){
        address.setUser(user);
        user.addAddress(address);

        return userRepository.save(user);
    }
}


