package com.example.MultiUserSecurityDemo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.orm.jpa.*;

import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.example.MultiUserSecurityDemo.adapter.persistence.repository")
@EntityScan(basePackages = "com.example.MultiUserSecurityDemo.adapter.persistence.entity")
public class MultiUserSecurityDemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(MultiUserSecurityDemoApplication.class, args);
	}

}
