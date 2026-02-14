package Manager.TeatroManager.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
@EnableWebSecurity
public class SwaggerConfig {
    

        @Bean
        public OpenAPI customOpenAPI(){

        return new OpenAPI()
            .components(new Components()
            .addSecuritySchemes("bearer-key", 
                new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")))
                .info(new Info().title("Teatro Manger API").version("1.0"))
                .addSecurityItem(new SecurityRequirement().addList("bearer-key"));
    }
}
