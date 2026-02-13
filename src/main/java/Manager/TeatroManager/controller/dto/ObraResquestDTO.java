package Manager.TeatroManager.controller.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class ObraResquestDTO {
    
    @NotBlank
    @NotNull(message="Necessário nome da Obra !")
    String nome; 

    
    LocalDate dataAssistida; 
    String local; 
    String diretor; 
    String elenco; 
    String descricao;
    Integer nota;
}
