package com.backend.backend.persistence.entity;

import java.util.UUID;
import java.time.*;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Entity
public class UserEntity {
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private UUID id;
    private String name;
    private String surname;
    private String username;
    private String email;
    private String password; //TODO: Make secure implementation
    private LocalDate dateOfBirth;
    private String address;

    public UserEntity(String name, String surname, String username, String email, String password, LocalDate dateOfBirth, String address){
        this.name = name;
        this.surname = surname;
        this.username = username;
        this.email = email;
        this.password = password;
        this.dateOfBirth = dateOfBirth;
        this.address = address;
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

    public String getEmail(){
        return email;
    }

    public String getPassword(){
        return password;
    }

    public LocalDate getDateOfBirth(){
        return dateOfBirth;
    }

    public String getAdress(){
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

    public void setAdress(String address){
        this.address = address;
    }

}




