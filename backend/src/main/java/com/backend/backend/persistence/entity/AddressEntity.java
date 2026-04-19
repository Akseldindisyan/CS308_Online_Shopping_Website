package com.backend.backend.persistence.entity;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
@Entity
public class AddressEntity {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private UUID id;

    private String city;
    private String street;
    private String postalCode;
    private String country;

    @ManyToOne
    @JoinColumn(name = "user_id")
    UserEntity user;

    public AddressEntity(String city, String street, String postalCode, String country){
        this.city = city;
        this.street = street;
        this.postalCode = postalCode;
        this.country = country;
    }
    
}
