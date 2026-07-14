package com.example.MultiUserSecurityDemo.adapter.web.service.impl;

import com.example.MultiUserSecurityDemo.domain.model.UserRoles1;
import com.example.MultiUserSecurityDemo.domain.model.UserRoles2;
import com.example.MultiUserSecurityDemo.domain.model.UserType1;
import com.example.MultiUserSecurityDemo.domain.model.UserType2;
import com.example.MultiUserSecurityDemo.domain.port.UserType1Port;
import com.example.MultiUserSecurityDemo.domain.port.UserType2Port;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(
        name = "app.test-users.enabled",
        havingValue = "true",
        matchIfMissing = false
)
public class TestUserInitializer implements ApplicationRunner {

    private final UserType1Port userType1Port;
    private final UserType2Port userType2Port;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {

        log.info("==================================================");
        log.info("Creating Demo Users");
        log.info("==================================================");

        createAdmin(
                "Super",
                "Admin",
                "anadINatu2001+admin@gmail.com",
                "8318428125",
                "Admin@123",
                UserRoles1.ADMIN
        );

        createAdmin(
                "Admin",
                "Type1",
                "anadINatu2001+admin1@gmail.com",
                "8707625812",
                "Admin1@1234",
                UserRoles1.ADMIN_TYPE1
        );

        createAdmin(
                "Admin",
                "Type2",
                "anadINatu2001+admin2@gmail.com",
                "9415022771",
                "Admin2@123",
                UserRoles1.ADMIN_TYPE2
        );

        /*
         * TYPE 2
         */

        createUser(
                "Normal",
                "User",
                "anadINatu2001+user@gmail.com",
                "8318428125",
                "User@123",
                UserRoles2.USER
        );

        createUser(
                "User",
                "Type1",
                "anadINatu2001+user1@gmail.com",
                "8707625812",
                "User1@123",
                UserRoles2.USER_TYPE1
        );

        createUser(
                "User",
                "Type2",
                "anadINatu2001+user2@gmail.com",
                "9415022771",
                "User2@123",
                UserRoles2.USER_TYPE2
        );

        log.info("==================================================");
        log.info("Demo Users Ready");
        log.info("==================================================");
    }

    private void createAdmin(
            String fname,
            String lname,
            String email,
            String phone,
            String password,
            UserRoles1 role) {

        if (userType1Port.findByEmail(email).isPresent()) {

            log.info("{} already exists.", email);

            return;
        }

        UserType1 admin = new UserType1();

        admin.setFname(fname);
        admin.setLname(lname);
        admin.setEmail(email);
        admin.setPhoneNumber(phone);

        admin.setPassword(passwordEncoder.encode(password));

        admin.setRoles1(role);

        admin.setApproved(true);

        admin.setEmailVerified(true);

        admin.setCreatedByAdmin("SYSTEM");

        admin.setProfilePicture(null);

        userType1Port.save(admin);

        log.info("Created ADMIN -> {} ({})", email, role);
    }

    private void createUser(
            String fname,
            String lname,
            String email,
            String phone,
            String password,
            UserRoles2 role) {

        if (userType2Port.findByEmail(email).isPresent()) {

            log.info("{} already exists.", email);

            return;
        }

        UserType2 user = new UserType2();

        user.setFname(fname);
        user.setLname(lname);
        user.setEmail(email);
        user.setPhoneNumber(phone);

        user.setPassword(passwordEncoder.encode(password));

        user.setRole(role);

        user.setApproved(true);

        user.setEmailVerified(true);

        user.setProvider("LOCAL");

        user.setCreatedByAdmin("SYSTEM");

        user.setProfilePicture(null);

        userType2Port.save(user);

        log.info("Created USER -> {} ({})", email, role);
    }
}
