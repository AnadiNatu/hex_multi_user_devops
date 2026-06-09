package com.example.MultiUserSecurityDemo.adapter.security.security_files;

import com.example.MultiUserSecurityDemo.adapter.security.user_details.UserType1Details;
import com.example.MultiUserSecurityDemo.adapter.security.user_details.UserType2Details;
import com.example.MultiUserSecurityDemo.domain.port.UserType1Port;
import com.example.MultiUserSecurityDemo.domain.port.UserType2Port;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CompositeUserDetailService implements UserDetailsService {

    private final UserType1Port userType1Port;
    private final UserType2Port userType2Port;

    public CompositeUserDetailService(UserType1Port userType1Port , UserType2Port userType2Port){
        this.userType1Port = userType1Port;
        this.userType2Port = userType2Port;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user1 = userType1Port.findByEmail(username);
        if (user1.isPresent()){
            return new UserType1Details(user1.get());
        }

        var user2 = userType2Port.findByEmail(username);
        if (user2.isPresent()){
            return new UserType2Details(user2.get());
        }

        throw new UsernameNotFoundException("User not found: " + username);
    }
}

