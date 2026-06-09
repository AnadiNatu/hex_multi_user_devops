package com.example.MultiUserSecurityDemo.notification;

import com.example.MultiUserSecurityDemo.config.TwilioConfig;
import com.example.MultiUserSecurityDemo.otp.OtpGenerator;
import com.example.MultiUserSecurityDemo.otp.OtpStore;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import com.twilio.rest.api.v2010.account.Message;


@Service
@RequiredArgsConstructor
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    private final TwilioConfig twilioConfig;
    private final OtpGenerator otpGenerator;
    private final OtpStore otpStore;

    public void sendSms(String toPhone , String body){
        String formattedNum = formatToE164(toPhone);
        try{
            Message message = Message.creator(
                    new PhoneNumber(formattedNum),
                    new PhoneNumber(twilioConfig.getPhoneNumber()),
                    body
            ).create();

            log.info("SMS sent | to={} | sid = {} | status={}" , toPhone , message.getSid() , message);
        }catch (Exception ex){
            log.error("SMS send failed | to = {} | error = {}" , toPhone , ex.getMessage() , ex);
            throw new RuntimeException("Failed to send SMS to " + toPhone , ex);
        }
    }

    public String sendOtpViaSms(String toPhone){
        String formattedNum = formatToE164(toPhone);
        String otp = otpGenerator.generate();
        otpStore.save(formattedNum , otp);
        sendSms(formattedNum , "Your OTP is: " +otp+ ". Valid for 5 minute");
        log.info("OTP sent via SMS | to={}" , formattedNum);
        return otp;
    }

    public boolean validateOtp(String phone, String otp) {
        String formattedNum = formatToE164(phone);
        boolean valid = otpStore.validate(formattedNum, otp);
        log.info("OTP validation | phone={} | valid={}", phone, valid);
        return valid;
    }

    private String formatToE164(String phone){
        if (phone == null || phone.isBlank()){
            throw new IllegalArgumentException("Phone number cannot be empty");
        }

        phone = phone.trim().replaceAll("[^\\d+]" , "");
        if (phone.startsWith("+")) return phone;
        if (phone.startsWith("91")) return "+" + phone;

        return "+91" + phone;
    }
}
