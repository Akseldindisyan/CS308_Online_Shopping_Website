package com.backend.backend.service;

import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.UserRepository;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class UserServiceTest {
    @Autowired 
    UserRepository userRepo;

    @Autowired
    UserService userService;

    @Test
    void Test1(){
        userService.createUser("Ayşe", "Demir", "aysedemir", "ayse.demir@example.com", "Secure123!", LocalDate.of(2000, 3, 14), "Beşiktaş, Istanbul");
        userService.createUser("Mehmet", "Kaya", "mehmetk", "mehmet.kaya@example.com", "MyPass456!", LocalDate.of(1995, 11, 2), "Ankara, Türkiye");
        userService.createUser("Elif", "Çelik", "elifcelik", "elif.celik@example.com", "ElifPass789!", LocalDate.of(2001, 7, 9), "İzmir, Türkiye");
    
        UserEntity a = userRepo.findByUsername("aysedemir");
        System.out.println(a);

        //Check for throw exception
        //Boolean res = userService.authenticate("ayse.demir@example.com111111", "Secure123!"); 
        Boolean res = userService.authenticate(a.getEmail(), "Secure123!");
        System.err.println(res);

    }
    
}
