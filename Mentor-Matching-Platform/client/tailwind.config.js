/** @type {import('tailwindcss').Config} */



// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // 指定你的内容扫描目录
  ],
  theme: {
    extend: {
      colors: {
        
          'border-brown': '#A16B45',
          'brown': '#F5EDE5',
          '2-brown': '#E8D9CC',
          'btnorange': '#E06105',
          
        
      },
    },
  },
  plugins: [],
};
