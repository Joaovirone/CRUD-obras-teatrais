package Manager.TeatroManager.controller;

import java.net.ResponseCache;

import org.apache.catalina.connector.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Manager.TeatroManager.config.TokenService;
import Manager.TeatroManager.controller.dto.LoginDTO;
import Manager.TeatroManager.controller.dto.UsuarioRequestDTO;
import Manager.TeatroManager.controller.dto.UsuarioResponseDTO;
import Manager.TeatroManager.controller.dto.UsuarioSenhaDTO;
import Manager.TeatroManager.controller.dto.mapper.UsuarioMapper;
import Manager.TeatroManager.entity.Usuario;
import Manager.TeatroManager.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/v1/usuarios")
@CrossOrigin("*")
@RequiredArgsConstructor
public class UsuarioController {
    
    private final UsuarioService service;
    private final TokenService tokenService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/cadastrar")
    public ResponseEntity <UsuarioResponseDTO> criarUsuario(@Valid @RequestBody UsuarioRequestDTO usuarioDTO) {
        
        Usuario usuario = service.criarUsuario(UsuarioMapper.toUsuario(usuarioDTO));


        return ResponseEntity.status(HttpStatus.CREATED).body(UsuarioMapper.toUsuarioResponseDTO(usuario));
    }

    @PostMapping("/login")
    public String loginUsuario(@RequestBody LoginDTO login) {
        
        var authenticationToken = new UsernamePasswordAuthenticationToken(login.getUsername(), login.getPassword());
        var authentication = authenticationManager.authenticate(authenticationToken);
        return tokenService.generateToken(authentication);
    }
    

    @PatchMapping("/{username}")
    public ResponseEntity<Void> atualizarSenha(@PathVariable String username, @Valid @RequestBody UsuarioSenhaDTO UsuarioDTO){
    
    service.atualizarSenha(username, UsuarioDTO.getSenhaAtual(), UsuarioDTO.getNovaSenha(), UsuarioDTO.getConfirmarSenha());

    return ResponseEntity.noContent().build();
    }


    @GetMapping("/{username}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorUsername(@PathVariable String username){
        Usuario usuario = service.buscarUsuarioPorUsername(username);

        return ResponseEntity.ok(UsuarioMapper.toUsuarioResponseDTO(usuario));

    }
    
}
