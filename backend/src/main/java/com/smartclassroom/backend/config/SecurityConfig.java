package com.smartclassroom.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import com.smartclassroom.backend.security.JwtAuthenticationFilter;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration
public class SecurityConfig {

    // ----------------------
    // Use AuthenticationManager from ApplicationConfig
    // ----------------------
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // ----------------------
    // Security Filter Chain
    // ----------------------
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Qualifier("corsConfigurationSource") CorsConfigurationSource corsConfigurationSource,
            AuthenticationProvider authenticationProvider,
            JwtAuthenticationFilter jwtAuthFilter
    ) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))   // enable CORS
            .csrf(csrf -> csrf.disable())                        // disable CSRF for APIs
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**", "/auth/**").permitAll()    // allow login/register
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/announcement/**").hasAnyRole("ADMIN", "TEACHER", "STUDENT")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/announcement/**").hasRole("ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/announcement/**").hasRole("ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/timetable/student/**").hasAnyRole("ADMIN", "STUDENT")
                .requestMatchers("/api/timetable/teacher/**", "/api/timetable/teacher-email/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/timetable/**").hasRole("ADMIN")
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                .requestMatchers("/api/leave/**").hasAnyRole("ADMIN", "TEACHER")
                .anyRequest().authenticated()                   // secure other endpoints
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ----------------------
    // CORS Configuration Source
    // ----------------------
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true); // required for Authorization header
        config.setAllowedOriginPatterns(List.of("http://localhost:5176", "http://localhost:5173")); // React frontend
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "Location")); // optional

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ----------------------
    // Optional: Highest precedence filter to fix preflight 403
    // ----------------------
    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistration(
            @Qualifier("corsConfigurationSource") CorsConfigurationSource corsConfigurationSource) {

        FilterRegistrationBean<CorsFilter> registrationBean =
                new FilterRegistrationBean<>(new CorsFilter(corsConfigurationSource));

        registrationBean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registrationBean;
    }
}
