package com.example.MultiUserSecurityDemo.domain.port;


import com.example.MultiUserSecurityDemo.domain.model.UserType1;

import java.util.Optional;

public interface UserType1Port {

    Optional<UserType1> findByEmail(String email);
    UserType1 save(UserType1 user);
    Optional<UserType1> findById(Long id);
    void deleteById(Long id);

}
