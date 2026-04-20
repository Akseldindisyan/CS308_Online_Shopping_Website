package com.backend.backend.api.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

public record RegisterRequestDTO(
		@NotBlank(message = "Name is required")
		@Size(max = 100, message = "Name must be at most 100 characters")
		String name,

		@NotBlank(message = "Surname is required")
		@Size(max = 100, message = "Surname must be at most 100 characters")
		String surname,

		@NotBlank(message = "Username is required")
		@Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
		String username,

		@NotBlank(message = "Email is required")
		@Email(message = "Email format is invalid")
		@Size(max = 255, message = "Email must be at most 255 characters")
		String email,

		@NotBlank(message = "Password is required")
		@Size(min = 8, max = 255, message = "Password must be between 8 and 255 characters")
		String password,

		@Past(message = "Date of birth must be in the past")
		LocalDate dateOfBirth,

		@Size(max = 255, message = "Address must be at most 255 characters")
		String address
) {
}

