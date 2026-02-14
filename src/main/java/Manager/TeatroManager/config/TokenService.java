package Manager.TeatroManager.config;

import java.security.interfaces.RSAKey;
import java.time.Instant;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;



@Service
public class TokenService {


    
    
    @Autowired
    private JwtEncoder encoder;

    public String generateToken(Authentication authenciation){

        Instant now = Instant.now();
        long expiry = 86400;

        String scope = authenciation.getAuthorities().stream()
                        .map(GrantedAuthority :: getAuthority)
                        .collect(Collectors.joining(" "));


        JwtClaimsSet claims = JwtClaimsSet.builder()
                    .issuer("TeatroManager")
                    .issuedAt(now)
                    .expiresAt(now.plusSeconds(expiry))
                    .subject(authenciation.getName())
                    .claim("scope", scope)
                    .build();

                    return encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
}
