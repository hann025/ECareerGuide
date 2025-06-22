import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This allows access from network interfaces, potentially useful for VMs or specific network setups
    port: 5173,
    strictPort: true // Ensures the port is available, or Vite will exit
  },
  optimizeDeps: {
    include: [
      '@ant-design/icons',
      'antd',
      'react-router-dom'
    ]
  }
})
