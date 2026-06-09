package com.example.MultiUserSecurityDemo.otp;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class OtpGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    public String generate(){
        int otp = 100_000 + RANDOM.nextInt(900_000);
        return String.valueOf(otp);
    }

}
