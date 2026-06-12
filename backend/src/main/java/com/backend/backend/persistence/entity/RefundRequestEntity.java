package com.backend.backend.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "refund_requests")
public class RefundRequestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name="refund_id")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity customer;

    @ManyToOne
    @JoinColumn(name = "invoice_id")
    private InvoiceEntity invoice;

    @ManyToMany
    @JoinTable(
            name = "refund_request_items",
            joinColumns = @JoinColumn(name = "refund_id"),
            inverseJoinColumns = @JoinColumn(name = "invoice_item_id")
    )
    private List<InvoiceItemEntity> items;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RefundStatus status = RefundStatus.UNDECIDED;

    @Temporal(TemporalType.TIMESTAMP)
    private Date date;
    @Column(name = "refund_amount")
    private double refundAmount;
}