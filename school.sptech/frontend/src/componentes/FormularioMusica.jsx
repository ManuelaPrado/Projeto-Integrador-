import { useState } from 'react'
import styles from './FormularioMusica.module.css'

const musicaInicial = {
  titulo: '',
  artista: '',
  album: '',
  genero: '',
  duracao: '',
  anoLancamento: '',
  comentario: ''
}

export function FormularioMusica({ onCadastrar }) {
  const [musica, setMusica] = useState(musicaInicial)

  function atualizarCampo(evento) {
    const nome = evento.target.name
    const valor = evento.target.value

    setMusica({
      ...musica,
      [nome]: valor
    })
  }

  function enviar(evento) {
    evento.preventDefault()

    onCadastrar({
      ...musica,
      anoLancamento: Number(musica.anoLancamento)
    })

    setMusica(musicaInicial)
  }

  return (
    <form className={styles.formulario} onSubmit={enviar}>
      <div className={styles.tituloArea}>
        <div>
          <h2>Cadastrar</h2>
        </div>
      </div>

      <label>
        Título
        <input
          name="titulo"
          value={musica.titulo}
          onChange={atualizarCampo}
        />
      </label>

      <label>
        Artista
        <input
          name="artista"
          value={musica.artista}
          onChange={atualizarCampo}
        />
      </label>

      <label>
        Álbum
        <input
          name="album"
          value={musica.album}
          onChange={atualizarCampo}
        />
      </label>

      <div className={styles.dupla}>
        <label>
          Gênero
            <input
          name="genero"
          value={musica.genero}
           placeholder="Ex:pop"
          onChange={atualizarCampo}
        />
        </label>

        <label>
          Duração
          <input
            name="duracao"
            value={musica.duracao}
            onChange={atualizarCampo}
            placeholder="00:00"
            maxLength="4"
          />
        </label>
      </div>

      <label>
        Ano de lançamento
        <input
          type="number"
          name="anoLancamento"
          value={musica.anoLancamento}
          onChange={atualizarCampo}
          placeholder="2000"
        />
      </label>

      <label>
        Comentário
        <textarea
            name="comentario"
            value={musica.comentario}
            onChange={atualizarCampo}
            placeholder="Tem algo a comentar sobre?"
            maxLength="500"
            rows="4"
        />
      </label>

      <button className={styles.botao} type="submit">
        Cadastrar música
      </button>
    </form>
  )
}
