package com.backend.backend.api.mapper;

import com.backend.backend.api.dto.UserDTO;
import com.backend.backend.persistence.entity.UserEntity;

public class UserMapper {

    public static UserDTO toDTO(UserEntity entity) {
        UserDTO dto = new UserDTO();
        dto.setId(entity.getID());
        dto.setName(entity.getName());
        dto.setSurname(entity.getSurname());
        dto.setUsername(entity.getUsername());
        dto.setEmail(entity.getEmail());
        dto.setDateOfBirth(entity.getDateOfBirth());
        dto.setAddress(entity.getAddress());
        return dto;
    }
}