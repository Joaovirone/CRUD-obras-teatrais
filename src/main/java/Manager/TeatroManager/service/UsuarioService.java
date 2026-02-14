package Manager.TeatroManager.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import Manager.TeatroManager.entity.Usuario;
import Manager.TeatroManager.exception.EntityNotFoundException;
import Manager.TeatroManager.exception.PasswordInvalidException;
import Manager.TeatroManager.exception.UsernameUniqueViolationException;
import Manager.TeatroManager.repository.UsuarioRepository;



@Service
public class UsuarioService implements UserDetailsService{
    
    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public Usuario criarUsuario(Usuario usuario){

        try {

            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            return repository.save(usuario);
        } catch (DataIntegrityViolationException e) {
            throw new UsernameUniqueViolationException((String.format("O email | %s | -- Já está cadastrado no banco de dados.", usuario)));
        }
    }


    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Usuario usuario = repository.findUsuarioByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + username));
                
        return org.springframework.security.core.userdetails.User
                .withUsername(usuario.getUsername())
                .password(usuario.getPassword())
                .authorities("USER") 
                .build();
}


    @Transactional(readOnly = true)
    public Usuario buscarUsuarioPorUsername(String username){

        return repository.findUsuarioByUsername(username)
                .orElseThrow(()-> new EntityNotFoundException((String.format("O email | %s | -- Não foi encontrado no banco de dados", username))));

    }

    @Transactional
    public Usuario atualizarSenha(String username, String senhaAtual, String novaSenha, String confirmarSenha){

        if(!novaSenha.equals(confirmarSenha)){
            throw new PasswordInvalidException("Nova senha não confere com a confirmação de senha!");

        }

        Usuario usuario = this.buscarUsuarioPorUsername(username);

        if (!passwordEncoder.matches(senhaAtual, usuario.getPassword())){

            throw new PasswordInvalidException("Senha atual não confere!");
        }

        usuario.setPassword(passwordEncoder.encode(novaSenha));
        return repository.save(usuario);
    }

}
