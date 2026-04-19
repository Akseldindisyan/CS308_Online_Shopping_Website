package com.backend.backend.persistence.entity;

import java.util.UUID;
import java.time.*;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@NoArgsConstructor
@Getter
@Setter
@Entity
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
    private String address = null;
    private Role role = Role.CUSTOMER;

    public UserEntity(String name, String surname, String username, String email, String password, LocalDate dateOfBirth, Role role){
        this.name = name;
        this.surname = surname;
        this.username = username;
        this.email = email;
        this.password = password;
        this.dateOfBirth = dateOfBirth;
        this.role = role;
    }

    public void addAddress(AddressEntity addressEntity){
        this.address.add(addressEntity);
    }

}




