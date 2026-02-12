package Manager.TeatroManager.repository;

import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;

import Manager.TeatroManager.entity.Obra;

public interface ObraRepository extends JpaRepository<Obra, UUID> {
    
    List<Obra> findByNomeContainigIgnoreCase(String nome);
}
