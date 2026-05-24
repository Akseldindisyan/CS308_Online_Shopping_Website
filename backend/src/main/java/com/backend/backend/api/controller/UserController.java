package com.backend.backend.api.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.api.dto.UserDTO;
import com.backend.backend.api.mapper.UserMapper;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.security.AppUserPrincipal;
import com.backend.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserDTO getCurrentUser(@AuthenticationPrincipal AppUserPrincipal principal) {
        return UserMapper.toDTO(userService.getUserById(principal.getUserId()));
    }

    @PutMapping("/me")
    public UserDTO updateCurrentUser(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @RequestBody UserDTO profile) {
        return UserMapper.toDTO(userService.updateProfile(principal.getUserId(), profile));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SALES_MANAGER', 'PRODUCT_MANAGER')")
    public List<UserEntity> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SALES_MANAGER', 'PRODUCT_MANAGER')")
    public UserEntity getUserById(@PathVariable UUID id) {
        return userService.getUserById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SALES_MANAGER', 'PRODUCT_MANAGER')")
    public UserEntity createUser(@RequestBody UserEntity user) {
        return userService.createUser(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SALES_MANAGER', 'PRODUCT_MANAGER')")
    public UserEntity updateUser(@PathVariable UUID id, @RequestBody UserEntity user) {
        return userService.updateUser(id, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('SALES_MANAGER', 'PRODUCT_MANAGER')")
    public void deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
    }
}
