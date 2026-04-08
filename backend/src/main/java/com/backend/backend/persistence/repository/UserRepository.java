package com.backend.backend.persistence.repository;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.backend.backend.persistence.entity.UserEntity;
import java.util.List;
import java.util.Optional;



@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    public UserEntity findByUsername(String username);
    public Optional<UserEntity> findByEmail(String email);
    
} 
