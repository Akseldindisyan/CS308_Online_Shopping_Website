package com.backend.backend.service;

import java.time.LocalDate;

import com.backend.backend.exception.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
    private final UserRepository UserRepo;

    public UserService(UserRepository UserRepo){
        this.UserRepo = UserRepo;
    }

    public void createUser(String name, String surname, String username, String email, String password, LocalDate dateOfBirth, String address){
        String hashPassword = encoder.encode(password);
        UserEntity newUser = new UserEntity(name, surname, username, email, hashPassword, dateOfBirth, address);
        UserRepo.save(newUser);
    }

    public Boolean authenticate(String email, String password){
        UserEntity user = null;
        try {
            user = UserRepo.findByEmail(email).orElseThrow(() -> new userNotExist("Incorrect email or password!"));
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
            throw new userNotExist("Incorrect email or password!!!!!!!");
        }
        catch(Exception e){
            System.out.println("Error: " + e.getMessage());
            return false;
        }

    }
}
