package school.sptech;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.web.bind.annotation.*;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/musicas")
@CrossOrigin(origins = "*")

public class MusicaController {

    private final JdbcTemplate template;

    public MusicaController(JdbcTemplate template) {
        this.template = template;
    }

    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody Musica musica) {

        String erro = validar(musica);

        if (erro != null) {
            return ResponseEntity.status(400).body(erro);
        }

        String sql = "INSERT INTO musica " +
                "(titulo, artista, album, genero, duracao, ano_lancamento, comentario) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";

        KeyHolder holder = new GeneratedKeyHolder();

        template.update(con -> {
            PreparedStatement statement = con.prepareStatement(
                    sql,
                    Statement.RETURN_GENERATED_KEYS
            );

            statement.setString(1, musica.getTitulo());
            statement.setString(2, musica.getArtista());
            statement.setString(3, musica.getAlbum());
            statement.setString(4, musica.getGenero());
            statement.setString(5, musica.getDuracao());
            statement.setInt(6, musica.getAnoLancamento());
            statement.setString(7, musica.getComentario());

            return statement;
        }, holder);

        if (holder.getKey() != null) {
            musica.setId(holder.getKey().intValue());
        }

        return ResponseEntity.status(201).body(musica);
    }

    @GetMapping
    public ResponseEntity<List<Musica>> listar(
            @RequestParam(required = false) String titulo,
            @RequestParam(required = false) String artista,
            
    ) {

        StringBuilder sql = new StringBuilder(
                "SELECT id, titulo, artista, album, genero, duracao, " +
                "ano_lancamento AS anoLancamento FROM musica WHERE 1 = 1"
        );

        List<Object> parametros = new ArrayList<>();

        if (titulo != null && !titulo.isBlank()) {
            sql.append(" AND titulo LIKE ?");
            parametros.add("%" + titulo + "%");
        }

        if (artista != null && !artista.isBlank()) {
            sql.append(" AND artista LIKE ?");
            parametros.add("%" + artista + "%");
        }

        sql.append(" ORDER BY id DESC");

        List<Musica> resultado = template.query(
                sql.toString(),
                new BeanPropertyRowMapper<>(Musica.class),
                parametros.toArray()
        );

        return ResponseEntity.status(200).body(resultado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Musica> buscarPorId(@PathVariable Integer id) {

        String sql = "SELECT id, titulo, artista, album, genero, duracao, " +
                "ano_lancamento AS anoLancamento FROM musica WHERE id = ?";

        try {
            Musica musica = template.queryForObject(
                    sql,
                    new BeanPropertyRowMapper<>(Musica.class),
                    id
            );

            return ResponseEntity.status(200).body(musica);

        } catch (EmptyResultDataAccessException exception) {
            return ResponseEntity.status(404).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Integer id) {

        if (!existePorId(id)) {
            return ResponseEntity.status(404).build();
        }

        String sql = "DELETE FROM musica WHERE id = ?";
        template.update(sql, id);

        return ResponseEntity.status(204).build();
    }

    private boolean existePorId(Integer id) {
        String sql = "SELECT COUNT(*) FROM musica WHERE id = ?";
        Integer quantidade = template.queryForObject(sql, Integer.class, id);
        return quantidade != null && quantidade > 0;
    }

    private String validar(Musica musica) {

        if (musica == null) {
            return "Os dados da música são obrigatórios.";
        }

        if (musica.getTitulo() == null || musica.getTitulo().isBlank()) {
            return "O título da música é obrigatório.";
        }

        if (musica.getArtista() == null || musica.getArtista().isBlank()) {
            return "O artista é obrigatório.";
        }

        if (musica.getAlbum() == null || musica.getAlbum().isBlank()) {
            return "O álbum é obrigatório.";
        }

        if (musica.getGenero() == null || musica.getGenero().isBlank()) {
            return "O gênero é obrigatório.";
        }

        if (musica.getDuracao() == null || !musica.getDuracao().matches("\\d{1,2}:\\d{2}")) {
            return "A duração deve estar no formato MM:SS.";
        }

        if (musica.getAnoLancamento() == null) {
            return "O ano de lançamento é obrigatório.";
        }

        int anoAtual = Year.now().getValue();

        if (musica.getAnoLancamento() < 1900 || musica.getAnoLancamento() > anoAtual) {
            return "O ano de lançamento deve estar entre 1900 e " + anoAtual + ".";
        }

        return null;
    }
}
