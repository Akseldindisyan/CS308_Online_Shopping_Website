package com.backend.backend.api.mapper;

import com.backend.backend.api.dto.UserDTO;
import com.backend.backend.persistence.entity.UserEntity;

public class UserMapper {

    public static UserDTO toDTO(UserEntity entity) {
        UserDTO dto = new UserDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setSurname(entity.getSurname());
        dto.setUsername(entity.getUsername());
        dto.setEmail(entity.getEmail());
        dto.setDateOfBirth(entity.getDateOfBirth());
        dto.setCountry(entity.getCountry());
        dto.setCity(entity.getCity());
        dto.setStreet(entity.getStreet());
        dto.setPostal_code(entity.getPostal_code());
        dto.setNat_id(entity.getNat_id());
        dto.setAddress(entity.getAddress());
        dto.setTax_id(entity.getTax_id());
        return dto;
    }
}