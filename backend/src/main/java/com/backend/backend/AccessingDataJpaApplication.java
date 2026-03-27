package com.backend.backend;

import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class AccessingDataJpaApplication {
 
    private static final Logger logger = LoggerFactory.getLogger(AccessingDataJpaApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(AccessingDataJpaApplication.class, args);
    }

    @Bean
    public CommandLineRunner demo(ProductRepository repository){
        return (args) -> {
            repository.save(new ProductEntity("A", 5.0, 10, "A", "A", "A", 5.0, "A", "A"));
            repository.save(new ProductEntity("Laptop A", 4.5, 50, "Model X", "SN12345", "High performance laptop", 1200.0, "Distributor A", "USA"));
            repository.save(new ProductEntity("Smartphone", 4.7, 100, "Model Y", "SN54321", "Latest smartphone", 800.0, "Distributor B", "China"));
            repository.save(new ProductEntity("Headphones", 4.2, 70, "Model H", "SN67890", "Noise-cancelling headphones", 200.0, "Distributor C", "Germany"));
            repository.save(new ProductEntity("Monitor", 4.6, 30, "Model M", "SN98765", "4K UHD monitor", 350.0, "Distributor D", "Japan"));
            repository.save(new ProductEntity("Keyboard", 4.1, 120, "Model K", "SN11223", "Mechanical keyboard", 100.0, "Distributor E", "USA"));
            repository.save(new ProductEntity("Mouse", 4.3, 150, "Model S", "SN44556", "Wireless mouse", 50.0, "Distributor F", "China"));
            repository.save(new ProductEntity("Printer", 4.0, 25, "Model P", "SN77889", "All-in-one printer", 250.0, "Distributor G", "Japan"));
            repository.save(new ProductEntity("Laptop B", 4.4, 60, "Model T", "SN99001", "10-inch tablet", 400.0, "Distributor H", "USA"));
            repository.save(new ProductEntity("Camera", 4.5, 40, "Model C", "SN22334", "Digital SLR camera", 900.0, "Distributor I", "Germany"));
            repository.save(new ProductEntity("Smartwatch", 4.2, 80, "Model W", "SN55667", "Fitness smartwatch", 150.0, "Distributor J", "China"));

            logger.info("Products");
            logger.info("-------------------------------");
            repository.findTop5ByOrderByRatingDesc().forEach(Product -> {
                logger.info(Product.toString());
            });
            logger.info("");
        };


    }
}
