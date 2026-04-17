package com.backend.backend.api.exception;

import org.springframework.http.HttpStatus;

public class ForbiddenOperationException extends ApiException {

    public ForbiddenOperationException(String code, String message) {
        super(HttpStatus.FORBIDDEN, code, message);
    }
}

