import styles from './ListaMusicas.module.css'

export function ListaMusicas({
  musicas,
  carregando,
  erro,
  mensagem,
  onBuscar,
  onRemover
}) {
  return (
    <section className={styles.lista}>
      <div className={styles.cabecalhoLista}>
        <div>
          <h2>Minhas músicas</h2>
  
        </div>

        <button className={styles.atualizar} onClick={onBuscar}>
          {'Buscar músicas'}
        </button>
      </div>

      {mensagem && <p className={styles.sucesso}>{mensagem}</p>}
      {erro && <p className={styles.erro}>{erro}</p>}

      {!carregando && musicas.length === 0 && (
        <div className={styles.vazio}>
          <p>Nenhuma música carregada.</p>
        </div>
      )}

      <div className={styles.cards}>
        {musicas.map(musica => (
          <div className={styles.card} key={musica.id}>
            <div className={styles.capa}>
            </div>

            <div className={styles.info}>
              <h3>{musica.titulo}</h3>
              <strong>{musica.artista}</strong>
              <p>{musica.album}</p>
                {musica.comentario && (
                    <p className={styles.comentario}>
                        "{musica.comentario}"
                    </p>
                )}

              <div className={styles.detalhes}>
                <span>{musica.genero}</span>
                <span>{musica.duracao}</span>
                <span>{musica.anoLancamento}</span>
              </div>
            </div>

            <button
              className={styles.excluir}
              onClick={() => onRemover(musica.id)}
              title="Excluir música"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
