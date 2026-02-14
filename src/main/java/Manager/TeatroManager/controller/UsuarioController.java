package Manager.TeatroManager.controller;

import java.net.ResponseCache;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Manager.TeatroManager.controller.dto.UsuarioRequestDTO;
import Manager.TeatroManager.controller.dto.UsuarioResponseDTO;
import Manager.TeatroManager.controller.dto.mapper.UsuarioMapper;
import Manager.TeatroManager.entity.Usuario;
import Manager.TeatroManager.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin("*")
@RequiredArgsConstructor
public class UsuarioController {
    
    private final UsuarioService service;

    @PostMapping
    public ResponseEntity <UsuarioResponseDTO> criarUsuario(@Valid @RequestBody UsuarioRequestDTO usuarioDTO) {
        
        Usuario usuario = service.criarUsuario(UsuarioMapper.toUsuario(usuarioDTO));


        return ResponseEntity.status(HttpStatus.CREATED).body(UsuarioMapper.toUsuarioResponseDTO(usuario));
    }
    
}
