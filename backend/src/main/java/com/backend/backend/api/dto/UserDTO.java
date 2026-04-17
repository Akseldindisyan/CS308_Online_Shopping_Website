package com.backend.backend.api.dto;

import com.backend.backend.persistence.entity.AddressEntity;

import java.time.LocalDate;
import java.util.UUID;

public class UserDTO {
    private UUID id;
    private String name;
    private String surname;
    private String username;
    private String email;
    private LocalDate dateOfBirth;
    private AddressEntity address;

    public UserDTO() {}

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getSurname() { return surname; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public AddressEntity getAddress() { return address; }

    public void setId(UUID id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setSurname(String surname) { this.surname = surname; }
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public void setAddress(AddressEntity address) { this.address = address; }
}