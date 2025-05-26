import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true
  },
  optimizeDeps: {
    include: [
      '@ant-design/icons',
      'antd',
      'react-router-dom'
    ]
  }
})