/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14161A',          // 본문 텍스트, 어두운 패널
        'ink-soft': '#1E2126',   // 패널 위 살짝 밝은 면
        paper: '#FBFAF8',        // 페이지 배경
        chalk: '#E7E5DF',        // 테두리, 구분선
        graphite: '#5B6169',     // 보조 텍스트
        cobalt: '#2B4BF2',       // 주요 액션
        'cobalt-deep': '#1E36C4',// 주요 액션 hover
        mint: '#00C48C',         // 성공, 여석 있음
        signal: '#FF5C38',       // 에러, 정원 마감
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        field: '10px', // 버튼, 인풋, 카드
        block: '4px',  // 시간표 블록
      },
    },
  },
  plugins: [],
}
