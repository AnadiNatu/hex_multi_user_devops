package com.example.MultiUserSecurityDemo.exception;

public class InvalidOperationException extends RuntimeException{

    private final String operation;

    public InvalidOperationException(String operation , String reason){
        super(String.format("Operation '%s' failed: %s" , operation , reason));
        this.operation = operation;
    }

    public String getOperation(){
        return operation;
    }
}
