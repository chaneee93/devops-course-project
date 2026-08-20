import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // amazon-cognito-identity-js가 Node.js 환경의 'global' 전역 변수를
  // 참조하는데, 브라우저에는 이게 없어서 에러가 남.
  // globalThis는 브라우저/Node.js 등 어떤 환경에서도 통하는 표준 전역 객체.
  define: {
    global: 'globalThis',
  },
})
