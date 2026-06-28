package com.example.MultiUserSecurityDemo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class SupabaseConfig {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.api-key}")
    private String supabaseApiKey;

    @Value("${supabase.storage.bucket}")
    private String bucket;

    @Bean
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }

    public String getSupabaseUrl(){
        return supabaseUrl;
    }

    public String getSupabaseApiKey(){
        return supabaseApiKey;
    }

    public String getBucket(){
        return bucket;
    }

    public String getStorageBaseUrl(){
        return supabaseUrl + "/storage/v1/object/" + bucket;
    }

    public String getPublicUrl(String filename){
        return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + filename;
    }
}
