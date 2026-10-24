package com.booknook.controller;

import com.booknook.dto.ApiResponse;
import com.booknook.model.HelpRequest;
import com.booknook.repository.HelpRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support")
public class SupportController {

    private final HelpRequestRepository helpRequestRepository;

    public SupportController(HelpRequestRepository helpRequestRepository) {
        this.helpRequestRepository = helpRequestRepository;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HelpRequest>> submitSupportTicket(
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String email = (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : body.getOrDefault("email", "guest@booknook.com");

        String requestType = body.getOrDefault("requestType", "General Inquiry");
        String subject = body.getOrDefault("subject", "No subject");
        String message = body.getOrDefault("message", "");

        if (message.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Message cannot be empty"));
        }

        HelpRequest ticket = new HelpRequest();
        ticket.setUserEmail(email);
        ticket.setRequestType(requestType);
        ticket.setSubject(subject);
        ticket.setMessage(message);
        ticket.setStatus("Open");

        HelpRequest saved = helpRequestRepository.save(ticket);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Your message has been sent. Our support team will get back to you shortly.", saved));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<HelpRequest>>> getMyTickets(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        List<HelpRequest> tickets = helpRequestRepository.findByUserEmailOrderByCreatedAtDesc(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<HelpRequest>>> getAllTickets() {
        List<HelpRequest> tickets = helpRequestRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }
}
