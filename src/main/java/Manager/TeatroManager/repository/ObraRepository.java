package Manager.TeatroManager.repository;

import java.util.*;
import java.time.*;
import org.springframework.data.jpa.repository.JpaRepository;

import Manager.TeatroManager.entity.Obra;

public interface ObraRepository extends JpaRepository<Obra, Long> {
    
    List<Obra> findByNomeContainingIgnoreCase(String nome);

    Optional<Obra> findObraByData(LocalDateTime data);

    List<Obra> findByDiretorContainingIgnoreCase(String diretor);

    Optional<Obra> findObraByDescricao(String descricao);

  
}
