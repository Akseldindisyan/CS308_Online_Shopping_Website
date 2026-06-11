package com.backend.backend.api.controller;

import com.backend.backend.api.dto.CategoryDTO;
import com.backend.backend.api.dto.CreateCategoryRequest;
import com.backend.backend.api.exception.ConflictException;
import com.backend.backend.api.exception.ResourceNotFoundException;
import com.backend.backend.persistence.entity.CategoryEntity;
import com.backend.backend.persistence.repository.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<CategoryDTO> getAll() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryDTO(c.getId(), c.getName()))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PRODUCT_MANAGER')")
    public CategoryDTO create(@RequestBody CreateCategoryRequest req) {
        if (req.name() == null || req.name().isBlank()) {
            throw new com.backend.backend.api.exception.BadRequestException("INVALID_NAME", "Category name cannot be blank");
        }
        if (categoryRepository.existsByName(req.name().trim())) {
            throw new ConflictException("CATEGORY_EXISTS", "Category already exists: " + req.name());
        }
        CategoryEntity saved = categoryRepository.save(new CategoryEntity(req.name().trim()));
        return new CategoryDTO(saved.getId(), saved.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('PRODUCT_MANAGER')")
    public void delete(@PathVariable UUID id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("CATEGORY_NOT_FOUND", "Category not found: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
