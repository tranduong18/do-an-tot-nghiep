package vn.jobhunter.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import vn.jobhunter.service.UserService;

@Configuration
public class PermissionInterceptorConfiguration implements WebMvcConfigurer {
    private final UserService userService;

    public PermissionInterceptorConfiguration(UserService userService) {
        this.userService = userService;
    }

    @Bean
    PermissionInterceptor getPermissionInterceptor() {
        return new PermissionInterceptor(userService);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        String[] whiteList = {
                "/", "/api/v1/auth/**", "/storage/**",
                "/api/v1/companies/**", "/api/v1/jobs/**", "/api/v1/skills/**", "/api/v1/files",
                "/api/v1/resumes/**",
                "/api/v1/subscribers/**", "/api/v1/favorites/**"
        };

        registry.addInterceptor(getPermissionInterceptor()).excludePathPatterns(whiteList);
    }
}
