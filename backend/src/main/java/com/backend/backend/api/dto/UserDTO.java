package com.backend.backend.api.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
public class UserDTO {
    private UUID id;
    private String name;
    private String surname;
    private String username;
    private String email;
    private LocalDate dateOfBirth;
    private String country;
    private String street;
    private String city;
    private String postal_code;
    private double balance;
}