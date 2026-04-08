package com.backend.backend.exception;

public class userNotExist extends RuntimeException {
    private String message;

    public userNotExist(String msg) {
        super(msg);
    }
}
