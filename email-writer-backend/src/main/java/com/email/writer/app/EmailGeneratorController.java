package com.email.writer.app;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@RestController
@RequestMapping("/api/email")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class EmailGeneratorController {
    
    private EmailGeneratorService emailGeneratorService;
    
    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailRequest) {
        try {
            String response = emailGeneratorService.generateEmailReply(emailRequest);
            return ResponseEntity.ok(response);
        } catch (WebClientResponseException.TooManyRequests e) {
            return ResponseEntity.status(429)
                    .body("AI service rate limit reached. Please try again later.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                .status(500)
                .body("Failed to generate AI reply.");
    }
    }
}
