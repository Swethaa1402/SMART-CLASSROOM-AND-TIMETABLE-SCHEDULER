package com.smartclassroom.backend.controllers.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.smartclassroom.backend.models.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    @JsonProperty("access_token")
    private String accessToken;
    @JsonProperty("token")
    private String token;
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String className;
}
