package com.backend.backend.persistence.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.backend.persistence.entity.CartEntity;
import com.backend.backend.persistence.entity.UserEntity;

@Repository
public interface CartRepository extends JpaRepository<CartEntity, UUID> {

    Optional<CartEntity> findByUserAndCheckedOutFalse(UserEntity user);

    Optional<CartEntity> findByGuestTokenAndCheckedOutFalse(String guestToken);
}

