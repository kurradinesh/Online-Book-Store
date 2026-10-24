package com.booknook.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Resolve absolute permanent path for uploads
        Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        if (uploadDir.endsWith(Paths.get("backend", "uploads"))) {
            uploadDir = uploadDir.getParent().getParent().resolve("uploads");
        }

        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
        } catch (Exception ignored) {}

        String uploadUri = uploadDir.toUri().toString();
        if (!uploadUri.endsWith("/")) {
            uploadUri += "/";
        }

        // Also register backend/uploads fallback if it exists
        Path backendUploads = uploadDir.resolveSibling("backend").resolve("uploads");
        try {
            if (!Files.exists(backendUploads)) {
                Files.createDirectories(backendUploads);
            }
        } catch (Exception ignored) {}

        String backendUri = backendUploads.toUri().toString();
        if (!backendUri.endsWith("/")) {
            backendUri += "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadUri, backendUri)
                .setCachePeriod(3600);
    }
}
