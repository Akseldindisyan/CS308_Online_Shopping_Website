package com.backend.backend.api.exception;

import org.springframework.http.HttpStatus;

public class EmailException extends ApiException {
    public EmailException(String message) {
        super(HttpStatus.INTERNAL_SERVER_ERROR, "EMAIL_SEND_FAILED", message);
    }
}