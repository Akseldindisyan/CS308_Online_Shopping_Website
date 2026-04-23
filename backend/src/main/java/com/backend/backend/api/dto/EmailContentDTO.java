package com.backend.backend.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.stream.Stream;

public record EmailContentDTO(

        @NotBlank(message = "Sender address cannot be blank")
        @Email(message = "Sender must be a valid email address")
        String from,

        @NotBlank(message = "Recipient address cannot be blank")
        @Email(message = "Recipient must be a valid email address")
        String to,

        List<@Email(message = "CC must contain valid email addresses") String> cc,

        List<@Email(message = "BCC must contain valid email addresses")  String> bcc,

        @NotBlank(message = "Subject cannot be blank")
        @Size(max = 998, message = "Subject exceeds maximum length")
        String subject,

        @NotNull(message = "Body cannot be null")
        String body,

        @NotBlank(message = "MIME type cannot be blank")
        String mimeType

) {
    public EmailContentDTO {
        cc       = (cc  != null) ? List.copyOf(cc)  : List.of();
        bcc      = (bcc != null) ? List.copyOf(bcc) : List.of();
    }

    public static EmailContentDTO simple(String from, String to,
                                         String subject, String body) {
        return new EmailContentDTO(from, to,
                List.of(), List.of(),
                subject, body, "text/plain");
    }

    public List<String> allRecipients() {
        return Stream.of(List.of(to), cc, bcc)
                .flatMap(List::stream)
                .toList();
    }
}