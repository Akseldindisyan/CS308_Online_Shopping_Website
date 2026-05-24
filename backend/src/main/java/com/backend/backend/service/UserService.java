package com.backend.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.backend.backend.persistence.entity.WishlistEntity;
import org.apache.catalina.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.backend.backend.api.dto.UserDTO;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final WishlistService wishlistService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, WishlistService wishlistService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.wishlistService = wishlistService;
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
        String hashPassword = passwordEncoder.encode(newUser.getPassword());
        newUser.setPassword(hashPassword);

        if (newUser.getRole() == null) {
            newUser.setRole(UserEntity.Role.CUSTOMER);
        }

        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

        return userRepository.save(newUser);
    }

    public UserEntity updateUser(UUID id, UserEntity updatedUser) {
        UserEntity existingUser = getUserById(id);
        String hashPassword = passwordEncoder.encode(updatedUser.getPassword());

        validateUniqueness(updatedUser, id);

        existingUser.setName(updatedUser.getName());
        existingUser.setSurname(updatedUser.getSurname());
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setEmail(updatedUser.getEmail());
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        existingUser.setDateOfBirth(updatedUser.getDateOfBirth());
        existingUser.setCountry(updatedUser.getCountry());
        existingUser.setCity(updatedUser.getCity());
        existingUser.setStreet(updatedUser.getStreet());
        existingUser.setPostal_code(updatedUser.getPostal_code());
        existingUser.setNat_id(updatedUser.getNat_id());
        existingUser.setAddress(updatedUser.getAddress());
        existingUser.setTax_id(updatedUser.getTax_id());

        if (updatedUser.getRole() != null) {
            existingUser.setRole(updatedUser.getRole());
        }

        return userRepository.save(existingUser);
    }

    public UserEntity updateProfile(UUID id, UserDTO updatedProfile) {
        UserEntity existingUser = getUserById(id);

        if (updatedProfile.getName() != null) {
            existingUser.setName(updatedProfile.getName());
        }
        if (updatedProfile.getSurname() != null) {
            existingUser.setSurname(updatedProfile.getSurname());
        }
        if (updatedProfile.getEmail() != null) {
            userRepository.findByEmail(updatedProfile.getEmail()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists: " + updatedProfile.getEmail());
                }
            });
            existingUser.setEmail(updatedProfile.getEmail());
        }

        existingUser.setDateOfBirth(updatedProfile.getDateOfBirth());
        existingUser.setCountry(updatedProfile.getCountry());
        existingUser.setCity(updatedProfile.getCity());
        existingUser.setStreet(updatedProfile.getStreet());
        existingUser.setPostal_code(updatedProfile.getPostal_code());
        existingUser.setNat_id(updatedProfile.getNat_id());
        existingUser.setAddress(updatedProfile.getAddress());
        existingUser.setTax_id(updatedProfile.getTax_id());

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
            if(passwordEncoder.matches(password, userPassword) == true){
                return true;
            }
            throw new Exception("Incorrect email or password!!!!!!!");
        }
        catch(Exception e){
            System.out.println("Error: " + e.getMessage());
            return false;
        }

    }

    public UserEntity getUserByUsername(String username){
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + username));
    }

    public List<String> getUsersWithWishlistItem(UUID productID){

        List<UserEntity> allUsers = userRepository.findAll();
        List<String> wishList = new ArrayList<>();
        List<WishlistEntity> temp = new ArrayList<>();
        for(int i = 0; i < allUsers.size(); i++){
             UserEntity temp_user = allUsers.get(i);
             temp = wishlistService.getWishlistEntity(temp_user.getId());
             for(int j = 0; j < temp.size(); j++){
                 if(temp.get(j).getProductId().equals(productID)){
                     wishList.add(temp_user.getEmail());
                     break;
                 }
             }
             temp.clear();
        }
        return wishList;
    }

}

