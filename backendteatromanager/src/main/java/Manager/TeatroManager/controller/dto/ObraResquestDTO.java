package Manager.TeatroManager.controller.dto;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class ObraResquestDTO {
    
    @NotBlank
    @NotNull(message="Necessário nome da Obra !")
    String nome; 

    @JsonFormat(pattern="yyyy-MM-dd")
    LocalDate data; 
    String local; 
    String diretor; 
    String elenco; 
    String descricao;
    Integer nota;
}
