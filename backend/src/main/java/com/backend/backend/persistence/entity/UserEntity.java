package com.backend.backend.persistence.entity;

import java.util.UUID;
import java.time.*;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;


@NoArgsConstructor
@Getter
@Setter
@Entity
@AllArgsConstructor
public class UserEntity {
    public enum Role{
        CUSTOMER,
        SALES_MANAGER,
        PRODUCT_MANAGER
    }

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private UUID id;
    private String name;
    private String surname;
    private String username;
    private String email;
    private String password; //TODO: Make secure implementation
    private LocalDate dateOfBirth = null;
    private String country;
    private String city;
    private String street;
    private String postal_code;
    private String nat_id;
    private String address;
    private String tax_id;

    @Enumerated(EnumType.STRING)
    private Role role = Role.CUSTOMER;

    public UserEntity(String name, String surname, String username, String email, String password, LocalDate dateOfBirth, Role role, String country, String city, String street, String postal_code){
        this.name = name;
        this.surname = surname;
        this.username = username;
        this.email = email;
        this.password = password;
        this.dateOfBirth = dateOfBirth;
        this.role = role;
        this.country = country;
        this.city = city;
        this.street = street;
        this.postal_code = postal_code;
    }

}




