package Manager.TeatroManager.controller.dto;

import java.time.LocalDate;

import lombok.Data;


@Data
public class ObraResponseDTO {
    
    String nome; 
    LocalDate dataAssistida; 
    String local; 
    String diretor; 
    String elenco; 
    String descricao;
    Integer nota;
}
