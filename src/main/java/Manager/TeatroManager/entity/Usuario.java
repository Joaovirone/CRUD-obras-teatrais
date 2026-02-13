package Manager.TeatroManager.entity;

import java.util.Objects;
import java.util.UUID;

import org.springframework.data.annotation.Id;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import lombok.Data;

@Entity
@Table(name= "usuarios")
@Data
public class Usuario {
    
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;

    @Column(name="user_email", unique= true, nullable=false, length=125)
    private String username;

    @Column(name="user_password", unique=true , nullable=false, length = 100)
    private String password;



    //Equals 
    @Override
    public boolean equals(Object object){
        if (object == null || getClass() != object.getClass()) return false;
        Usuario usuario = (Usuario) object;

        return Objects.equals(id, usuario.id);
        
    }
    //HashCode
    @Override
    public int hashCode(){
        return Objects.hashCode(id);
    }

    //toString
    @Override
    public String toString(){
        return "Usuario{" + "id=" + id + '}';
    }
}
