/** @type {import('tailwindcss').Config} **/
module.exports = {
  content: ["./templates/**/*.html", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
        colors: {
            // Original colors
            'black': '#0B0B0C',
            'gold': '#C6A052',
            'gray': '#1F2125',
            'mist': '#F7F7F7',
            // Celestial/Website theme colors
            'obsidian': '#0a0a0a',
            'parchment': '#f5e6d3',
            'starlight': '#e8d5b7',
            'celestial': '#c9a874',
            'verdigris': '#43b3ae',
        },
        boxShadow: {
            soft: '0 10px 30px rgba(0,0,0,0.15)',
            celestial: '0 0 10px rgba(198, 166, 100, 0.6)',
        },
        fontFamily: {
            garamond: ['"EB Garamond"', 'serif'],
        },
        animation: {
            'float': 'float 6s ease-in-out infinite',
            'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
            'orbit-1': 'orbit-1 40s linear infinite',
            'orbit-2': 'orbit-2 60s linear infinite',
            'orbit-3': 'orbit-3 90s linear infinite',
            'orbit-4': 'orbit-4 120s linear infinite',
            'twinkle': 'twinkle 3s ease-in-out infinite',
            'rotate-slow': 'rotate-slow 120s linear infinite',
        },
        keyframes: {
            float: {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-20px)' },
            },
            'pulse-slow': {
                '0%, 100%': { opacity: '1' },
                '50%': { opacity: '0.5' },
            },
            'orbit-1': {
                from: { transform: 'rotate(0deg) translateX(150px) rotate(0deg)' },
                to: { transform: 'rotate(360deg) translateX(150px) rotate(-360deg)' },
            },
            'orbit-2': {
                from: { transform: 'rotate(0deg) translateX(220px) rotate(0deg)' },
                to: { transform: 'rotate(360deg) translateX(220px) rotate(-360deg)' },
            },
            'orbit-3': {
                from: { transform: 'rotate(0deg) translateX(300px) rotate(0deg)' },
                to: { transform: 'rotate(360deg) translateX(300px) rotate(-360deg)' },
            },
            'orbit-4': {
                from: { transform: 'rotate(0deg) translateX(380px) rotate(0deg)' },
                to: { transform: 'rotate(360deg) translateX(380px) rotate(-360deg)' },
            },
            twinkle: {
                '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
                '50%': { opacity: '1', transform: 'scale(1.2)' },
            },
            'rotate-slow': {
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(360deg)' },
            },
        },
    },
  },
  plugins: [require("flowbite/plugin")],
};
