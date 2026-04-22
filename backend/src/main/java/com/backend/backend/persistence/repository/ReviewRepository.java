package com.backend.backend.persistence.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.backend.persistence.entity.ReviewEntity;
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.entity.UserEntity;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, UUID> {


}
