package Manager.TeatroManager.controller;


import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Manager.TeatroManager.controller.dto.ObraResponseDTO;
import Manager.TeatroManager.controller.dto.ObraResquestDTO;
import Manager.TeatroManager.controller.dto.mapper.ObraMapper;
import Manager.TeatroManager.entity.Obra;
import Manager.TeatroManager.service.ObraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.web.bind.annotation.PostMapping;



@RestController
@RequestMapping("/api/v1/obras")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ObraController {
    
    @Autowired
    private ObraService service;

    @PostMapping
    public ResponseEntity <ObraResponseDTO> criarObra(@RequestBody @Valid ObraResquestDTO obraDTO) {
        
        Obra obra = ObraMapper.toObra(obraDTO);
        service.salvarObra(obra);

        return ResponseEntity.status(201).body(ObraMapper.toObraResponseDto(obra));

    }
    
    @GetMapping
    public ResponseEntity<List<ObraResponseDTO>> listarTodasObras() {
     
        List<Obra> obras = service.buscarTodasAsObras();

        List<ObraResponseDTO> obrasDTO = obras.stream()
            .map(ObraMapper :: toObraResponseDto)
            .collect(Collectors.toList());


        return ResponseEntity.ok().body(obrasDTO);
    }
    
}
