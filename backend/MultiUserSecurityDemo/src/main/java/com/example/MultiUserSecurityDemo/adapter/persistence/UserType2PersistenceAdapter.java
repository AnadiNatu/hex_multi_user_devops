package com.example.MultiUserSecurityDemo.adapter.persistence;

import com.example.MultiUserSecurityDemo.adapter.persistence.mapper.UserType2Mapper;
import com.example.MultiUserSecurityDemo.adapter.persistence.repository.UserType2Repository;
import com.example.MultiUserSecurityDemo.domain.model.UserType2;
import com.example.MultiUserSecurityDemo.domain.port.UserType2Port;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class UserType2PersistenceAdapter implements UserType2Port {

    private final UserType2Repository repository;
    private final UserType2Mapper mapper;

    public UserType2PersistenceAdapter(UserType2Repository repository, UserType2Mapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public Optional<UserType2> findByEmail(String email) {
        return repository.findByEmail(email)
                .map(mapper::toDomain);
    }

    @Override
    public UserType2 save(UserType2 user) {
        var entity = mapper.toEntity(user);
        var savedEntity = repository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<UserType2> findById(Long id) {
        return repository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

}
