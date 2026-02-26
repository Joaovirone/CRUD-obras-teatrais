package Manager.TeatroManager.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UsuarioRequestDTO {
 
    @NotBlank
    @NotNull(message="Email é obrigatório !")
    private String username; 

    @NotBlank
    @NotNull(message="Senha é obrigatória !")
    private String password;
}
