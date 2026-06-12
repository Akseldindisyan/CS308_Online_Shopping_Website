package com.backend.backend.persistence.repository;

import com.backend.backend.persistence.entity.RefundRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;
import java.util.Date;
import com.backend.backend.persistence.entity.RefundStatus;

@Repository
public interface RefundRequestRepository extends JpaRepository<RefundRequestEntity, UUID> {

    // Used to find a specific refund request when the manager accepts/rejects it
    Optional<RefundRequestEntity> findById(UUID id);

    // Used to save a new refund request or update an existing one's status
    RefundRequestEntity save(RefundRequestEntity entity);

    List<RefundRequestEntity> findByCustomerId(UUID customerId);

    boolean existsByStatusAndItemsId(RefundStatus status, UUID itemId);

    List<RefundRequestEntity> findByStatusAndDateBetween(RefundStatus status, Date start, Date end);

    List<RefundRequestEntity> findByStatusOrderByDateDesc(RefundStatus status);
}
