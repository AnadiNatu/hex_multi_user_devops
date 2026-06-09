package com.example.MultiUserSecurityDemo.notification;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final EmailService emailService;
    private final SmsService smsService;

    public void sendDualChannelOtp(String email, String phone) {
        log.info("Sending dual-channel OTP | email={} | phone={}", email, phone);
        emailService.sendOtpViaEmail(email);
        smsService.sendOtpViaSms(phone);
    }

    public void sendWelcomeNotification(String email, String phone, String firstName) {
        log.info("Sending welcome notification | email={} | phone={}", email, phone);
        emailService.sendWelcomeEmail(email, firstName);
        smsService.sendSms(phone, "Welcome " + firstName + "! Your account on MultiUser Platform has been created.");
    }

    public void sendPasswordResetOtp(String email) {
        log.info("Sending password reset OTP | email={}", email);
        emailService.sendOtpViaEmail(email);
    }

    public void sendLoginAlert(String phone, String firstName) {
        log.info("Sending login alert SMS | phone={}", phone);
        smsService.sendSms(phone, "Hi " + firstName + ", a new login to your MultiUser account was detected. If this wasn't you, contact support immediately.");
    }

//    ===NEW CODE===
//    @Async
//    public void sendOtpByEmail(String email){
//        String cacheKey = "otp:email:"+email;
//        String otp = otpService.generateAndStore(cacheKey);
//        emailService.sendOtpEmail(email , otp);
//        log.info("[NOTIFY] OTP dispatched via email to={}" , email);
//    }
//
//    @Async
//    public void sendOtpBySms(String phoneNumber){
//        String cacheKey = "otp:sms:"+phoneNumber;
//        String otp = otpService.generateAndStore(cacheKey);
//        smsService.sendOtp(phoneNumber , otp);
//        log.info("[NOTIFY] OTP dispatched via SMS to = {}" , phoneNumber);
//    }
//
//    public boolean verifySmsOtp(String phoneNumber , String submittedOtp){
//        return otpService.verify("otp:sms:" + phoneNumber , submittedOtp);
//    }

}
