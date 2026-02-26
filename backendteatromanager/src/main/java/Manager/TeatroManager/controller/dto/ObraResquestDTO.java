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
   private String nome; 

   @JsonFormat(pattern="yyyy-MM-dd")
   private LocalDate data; 
   
   private String local; 
   private String diretor; 
   private String elenco; 
   private String descricao;
   private Integer nota;
}
