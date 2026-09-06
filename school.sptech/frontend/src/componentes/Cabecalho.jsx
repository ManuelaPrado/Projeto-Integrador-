import styles from './Cabecalho.module.css'

export function Cabecalho() {
  return (
    <header className={styles.cabecalho}>
      <div className={styles.logo}>
        <span className={styles.icone}>O</span>
        <span>Masic</span>
      </div>

      <span className={styles.status}><a href="https://www.instagram.com/_mah.nu_/">_mah.nu_ </a></span>
    </header>
  )
}
