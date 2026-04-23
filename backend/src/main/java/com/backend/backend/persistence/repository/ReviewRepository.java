package com.backend.backend.persistence.repository;

import java.time.LocalDate;
import java.util.Date;
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

    //Product
    List<ReviewEntity> findByUser(UserEntity user);

    //User
    List<ReviewEntity> findByProduct(ProductEntity product);

    //Rating
    List<ReviewEntity> findByRating(int rating);

    //Comments
    List<ReviewEntity> findByComment(String comment);

    //Product But Date
    List<ReviewEntity> findByProductBuyDate(LocalDate productBuyDate);
    List<ReviewEntity> findByProductBuyDateLessThanEqual(LocalDate productBuyDate);
    List<ReviewEntity> findByProductBuyDateGreaterThanEqual(LocalDate productBuyDate);

    //Found This Helpful
    List<ReviewEntity> findByFoundThisHelpful(int foundThisHelpful);
    List<ReviewEntity> findByFoundThisHelpfulLessThanEqual(int foundThisHelpful);
    List<ReviewEntity> findByFoundThisHelpfulGreaterThanEqual(int foundThisHelpful);

    //Created At
    List<ReviewEntity> findByCreatedAt(LocalDate createdAt);
    List<ReviewEntity> findByCreatedAtLessThanEqual(LocalDate createdAt);
    List<ReviewEntity> findByCreatedAtGreaterThanEqual(LocalDate createdAt);

    //Approved At
    List<ReviewEntity> findByApprovedAt(LocalDate approvedAt);
    List<ReviewEntity> findByApprovedAtLessThanEqual(LocalDate approvedAt);
    List<ReviewEntity> findByApprovedAtGreaterThanEqual(LocalDate approvedAFixed );





}
