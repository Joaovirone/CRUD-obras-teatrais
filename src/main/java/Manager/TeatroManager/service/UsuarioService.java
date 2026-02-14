package Manager.TeatroManager.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import Manager.TeatroManager.entity.Usuario;
import Manager.TeatroManager.exception.UsernameUniqueViolationException;
import Manager.TeatroManager.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

@Service
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository repository;

    @Transactional
    public Usuario criarUsuario(Usuario usuario){

        try {
            return repository.save(usuario);
        } catch (DataIntegrityViolationException e) {
            throw new UsernameUniqueViolationException((String.format("O email | %s | -- Já está cadastrado no banco de dados.", usuario)));
        }
    }

    @Transactional
    public List<Usuario> buscarUsuarioPorUsername(String username){

        try {
            return repository.findUsuarioByUsername(username);
        } catch (Exception e) {
            throw new EntityNotFoundException((String.format("O email | %s | -- Não foi encontrado", username)));
        }


    }

}
