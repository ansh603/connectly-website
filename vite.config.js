import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  // Make assets work whether deployed at `/AC/react/dostnow/` or at domain root.
  // Using `./` keeps asset URLs relative.
  base: './',
})
