package com.backend.backend.persistence.repository;
import com.backend.backend.persistence.entity.InvoiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<InvoiceEntity, UUID> {
    List<InvoiceEntity> findByCustomerId(UUID customerId);

    List<InvoiceEntity> findAllByOrderByDateAsc();

    List<InvoiceEntity> findByDateGreaterThanEqualAndDateLessThanOrderByDateAsc(
            Date startInclusive, Date endExclusive);
}