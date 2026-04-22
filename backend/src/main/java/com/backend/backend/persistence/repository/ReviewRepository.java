package com.backend.backend.persistence.repository;

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
    //Rating
    List<ReviewEntity> findByRating(int rating);

    //Comments
    Optional<ReviewEntity> findByComment(String comment);

    //Product But Date
    List<ReviewEntity> findByProductBuyDate(Date productBuyDate);
    List<ReviewEntity> findByProductBuyDateLessThanEqual(Date productBuyDate);
    List<ReviewEntity> findByProductBuyDateGreaterThanEqual(Date productBuyDate);

    //Found This Helpful
    List<ReviewEntity> findByFoundThisHelpful(int foundThisHelpful);
    List<ReviewEntity> findByFoundThisHelpfulLessThanEqual(int foundThisHelpful);
    List<ReviewEntity> findByFoundThisHelpfulGreaterThanEqual(int foundThisHelpful);

    //Created At
    List<ReviewEntity> findByCreatedAt(Date createdAt);
    List<ReviewEntity> findByCreatedAtLessThanEqual(Date createdAt);
    List<ReviewEntity> findByCreatedAtGreaterThanEqual(Date createdAt);

    //Approved At
    List<ReviewEntity> findByApprovedAt(Date approvedAt);
    List<ReviewEntity> findByApprovedAtLessThanEqual(Date approvedAt);
    List<ReviewEntity> findByApprovedAtGreaterThanEqual(Date approvedAFixed );





}
