package com.example.MultiUserSecurityDemo.adapter.persistence;

import com.example.MultiUserSecurityDemo.adapter.persistence.mapper.ProductMapper;
import com.example.MultiUserSecurityDemo.adapter.persistence.repository.ProductRepository;
import com.example.MultiUserSecurityDemo.domain.model.Product;
import com.example.MultiUserSecurityDemo.domain.port.ProductPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class ProductPersistenceAdapter implements ProductPort {

    private final ProductRepository repository;
    private final ProductMapper mapper;

    public ProductPersistenceAdapter(ProductRepository repository , ProductMapper mapper){
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public Product save(Product product) {
        var entity = mapper.toEntity(product , product.getOwnerType());
        var savedEntity = repository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Product> findById(Long id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Product> findAll() {
        return repository.findAll().stream().map(mapper::toDomain).collect(Collectors.toList());
    }

    @Override
    public List<Product> findByCategory(String category) {
        return repository.findByCategory(category).stream().map(mapper::toDomain).collect(Collectors.toList());
    }

    @Override
    public List<Product> findByIsActive(Boolean isActive) {
        return repository.findByIsActive(isActive).stream().map(mapper::toDomain).collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return repository.existsById(id);
    }
}
