package com.example.MultiUserSecurityDemo.notification;

import com.example.MultiUserSecurityDemo.otp.OtpGenerator;
import com.example.MultiUserSecurityDemo.otp.OtpStore;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

//import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final OtpGenerator otpGenerator;
    private final OtpStore otpStore;

    public void sendEmail(String to, String subject, String body, boolean isHtml){
        try{
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message , true , "UTF-8");

            helper.setFrom("blackplaindot@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body , isHtml);

            mailSender.send(message);

            log.info("Email sent | to={} | subject={}" , to , subject);

        } catch (MessagingException ex) {
            log.error("Email send failed | to={} | subject={} | error={}" , to , subject , ex.getMessage());
            throw new RuntimeException(ex);
        }
    }

    public void sendOtpViaEmail(String toEmail){
        String otp = otpGenerator.generate();
        otpStore.save(toEmail , otp);

        String subject = "Your OTP Code";
        String body = buildOtpEmailBody(otp);
        sendEmail(toEmail , subject , body , true);
        log.info("OTP sent via Email | to={}" , toEmail);
    }

    public boolean validateOtp(String email , String otp){
        boolean valid = otpStore.validate(email , otp);
        log.info("OTP validation | email={} | valid={}" , email , valid);
        return valid;
    }

//    public void sendWelcomeEmail(String toEmail , String firstName){
//        String subject = "Welcome to MultiUser Platform";
//        String body = "<h2>Hi " + firstName + ",</h2>"
//                + "<p>Your account has been successfully created.</p>"
//                + "<p>You can now log in and explore the platform.</p>"
//                + "<br/><p>Regards,<br/>The MultiUser Team</p>";
//        sendEmail(toEmail, subject, body, true);
//    }

    private String buildOtpEmailBody(String otp) {
        return "<div style='font-family:Arial,sans-serif;max-width:480px;margin:auto;'>"
                + "<h2>OTP Verification</h2>"
                + "<p>Use the following One-Time Password to verify your identity:</p>"
                + "<h1 style='letter-spacing:8px;color:#2E75B6;'>" + otp + "</h1>"
                + "<p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>"
                + "</div>";
    }

    public void sendSimpleEmail(String to, String subject , String body){
        try{
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("[EMAIL] Plain email sent to = {} | subject = '{}'" , to , subject);
        }catch (Exception ex){
            log.error("[EMAIL] Failed to send email to={} | error={}" , to , ex);
            throw new RuntimeException("Email delivery failed: " + ex.getMessage());
        }
    }

    public void sendHtmlEmail(String to , String subject , String htmlBody){
        try{
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage , true , "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody , true);
            mailSender.send(mimeMessage);
            log.info("[EMAIL] HTML email sent to={} | subject={}" , to , subject);
        } catch (MessagingException e) {
            log.error("[EMAIL] Failed to send HTML email to={} | error={}" , to , e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public void sendOtpEmail(String to , String otp){
        String subject = "Your OTP Verification Code";
        String body = "Your one-time password is:" +otp+ "\n\nThis code is valid for 5 minutes only";
        sendSimpleEmail(to , subject , body);
    }

    public void sendWelcomeEmail(String to, String firstName){
        String subject = "Welcome!";
        String body = "Hi " +firstName+ " ,\n\n Your account has been created";
        sendSimpleEmail(to , subject , body);
    }
}
