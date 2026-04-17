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
    private String password;
    private LocalDate dateOfBirth;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AddressEntity> address = new ArrayList<>();
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

    public UUID getID(){
        return id;
    }

    public String getName(){
        return name;
    }

    public String getSurname(){
        return surname;
    }

    public String getUsername() { return username; }

    public String getEmail(){
        return email;
    }

    public String getPassword(){
        return password;
    }

    public LocalDate getDateOfBirth(){
        return dateOfBirth;
    }

    public String getAddress(){
        return address;
    }

    public void setName(String name){
        this.name = name;
    }

    public void setSurname(String surname){
        this.surname = surname;
    }

    public void setEmail(String email){
        this.email = email;
    }

    public void setPassword(String password){
        this.password = password;
    }

    public void setDateOfBirth(LocalDate dateOfBirth){ 
        this.dateOfBirth = dateOfBirth;
    }

    public void addAddress(AddressEntity addressEntity){
        this.address.add(addressEntity);
    }

}




