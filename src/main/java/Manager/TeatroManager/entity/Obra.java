package Manager.TeatroManager.entity;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "obras_teatrais")
public class Obra {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;

    @Column(name="nome_da_obra",nullable=false)
    private String nome;

    @Column(name="data_da_obra",columnDefinition="")
    private LocalDateTime data;

    @Column(name="local_da_obra")
    private String local;

    @Column(name="nome_do_diretor")
    private String diretor;

    @Column(name="nome_do_elenco", columnDefinition="TEXT")
    private String elenco;

    @Column(name="descricao_da_obra", columnDefinition="TEXT")
    private String descricao;

    @Column(name="nota_da_obra", length=10)
    private Integer nota;


    
    //Equals 
    @Override
    public boolean equals(Object object){
        if (object == null || getClass() != object.getClass()) return false;
        Obra obra = (Obra) object;

        return Objects.equals(id, obra.id);
        
    }
    //HashCode
    @Override
    public int hashCode(){
        return Objects.hashCode(id);
    }

    //toString
    @Override
    public String toString(){
        return "Obra{" + "id=" + id + '}';
    }

}
