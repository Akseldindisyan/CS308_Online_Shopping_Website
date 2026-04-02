package com.backend.backend;

import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.repository.ProductRepository;

import io.github.cdimascio.dotenv.Dotenv;

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
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        System.setProperty("DB_URL", dotenv.get("DB_URL", ""));
        System.setProperty("DB_USERNAME", dotenv.get("DB_USERNAME", ""));
        System.setProperty("DB_PASSWORD", dotenv.get("DB_PASSWORD", ""));
        SpringApplication.run(AccessingDataJpaApplication.class, args);
    }

}
