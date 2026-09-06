import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // "npm run build" já gera os arquivos direto dentro da API Java, para
    // que o Spring Boot sirva o front-end e a API a partir do mesmo
    // processo (mvnw spring-boot:run), sem precisar de dois terminais.
    outDir: '../src/main/resources/static',
    emptyOutDir: true,
  },
})
