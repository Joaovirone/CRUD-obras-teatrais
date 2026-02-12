package Manager.TeatroManager.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Manager.TeatroManager.entity.Obra;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/obras")
@CrossOrigin(origins = "*")
public class ObraController {
    
    @Autowired
    private ObraService service;

    @GetMapping
    public ResponseEntity<List<Obra>> listarTodasObras() {
        return ResponseEntity.ok();
    }
    
}
