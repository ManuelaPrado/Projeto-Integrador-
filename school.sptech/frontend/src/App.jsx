import { useState } from 'react'
import axios from 'axios'
import styles from './App.module.css'
import { Cabecalho } from './componentes/Cabecalho'
import { FormularioMusica } from './componentes/FormularioMusica'
import { ListaMusicas } from './componentes/ListaMusicas'

const API = 'http://localhost:8080/musicas'

function App() {
  const [musicas, setMusicas] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  function buscarMusicas() {
    setCarregando(true)
    setErro('')

    axios.get(API)
      .then(resposta => {
        setMusicas(resposta.data)
      })
      .catch(() => {
        setErro('Não foi possível buscar as músicas. Verifique se a API está rodando.')
      })
      .finally(() => {
        setCarregando(false)
      })
  }

  function cadastrarMusica(musica) {
    setMensagem('')
    setErro('')

    axios.post(API, musica)
      .then(resposta => {
        setMusicas([resposta.data, ...musicas])
        setMensagem('Música cadastrada com sucesso!')
      })
      .catch(erroRequisicao => {
        if (erroRequisicao.response?.data) {
          setErro(String(erroRequisicao.response.data))
        } else {
          setErro('Não foi possível cadastrar a música. Verifique se a API está rodando.')
        }
      })
  }

  function removerMusica(id) {
    axios.delete(`${API}/${id}`)
      .then(() => {
        setMusicas(musicas.filter(musica => musica.id !== id))
        setMensagem('Música removida com sucesso!')
      })
      .catch(() => {
        setErro('Não foi possível remover a música.')
      })
  }

  return (
    <div className={styles.app}>
      <Cabecalho />

      <main className={styles.conteudo}>
        <section className={styles.introducao}>
          <h1 className={styles.tag}>MINHA COLEÇÃO</h1>
          <p>Registre aqui as musicas que marcaram o seu dia</p>
        </section>

        <section className={styles.grid}>
          <FormularioMusica onCadastrar={cadastrarMusica} />
          <ListaMusicas
            musicas={musicas}
            carregando={carregando}
            erro={erro}
            mensagem={mensagem}
            onBuscar={buscarMusicas}
            onRemover={removerMusica}
          />
        </section>
      </main>
    </div>
  )
}

export default App
