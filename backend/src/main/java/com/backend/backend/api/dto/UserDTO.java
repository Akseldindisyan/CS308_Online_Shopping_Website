package com.backend.backend.api.dto;

import com.backend.backend.persistence.entity.AddressEntity;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
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
    private List<AddressEntity> address;

}