package Manager.TeatroManager.controller.dto;

import java.time.LocalDate;

import lombok.Data;


@Data
public class ObraResponseDTO {
    
    private String nome; 
    private LocalDate data; 
    private String local; 
    private String diretor; 
    private String elenco; 
    private String descricao;
    private Integer nota;
}
