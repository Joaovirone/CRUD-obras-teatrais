package Manager.TeatroManager.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import Manager.TeatroManager.entity.Obra;
import Manager.TeatroManager.repository.ObraRepository;

@Service
public class ObraService {
    
    @Autowired
    private ObraRepository repository;

    public List<Obra> listarTodasAsObras(){

        // Aqui você poderia ordenar por data, nota, etc.
        // Ex: return repository.findAll(Sort.by(Sort.Direction.DESC, "dataAssistida"));

        return repository.findAll();
    }

    public Obra buscarObraPorNome(String nome){

        return repository.findByNomeContainigIgnoreCase(nome)
                            .orElseThrow(() -> new RuntimeException("Obra não encontrada com nome: " + nome));

    }
    
    @Transactional
    public Obra salvar(Obra obra){

        

        obra.setId(null);

        return repository.save(obra);
    }
}
