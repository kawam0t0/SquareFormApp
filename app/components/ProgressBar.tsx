@import url("https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@300;400;500;700&display=swap");
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 213 100% 50%;
    --primary-foreground: 0 0% 100%;
    --secondary: 213 100% 60%;
    --secondary-foreground: 0 0% 100%;
    --muted: 213 100% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 213 100% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 213 100% 50%;
    --radius: 1rem;
  }

  html,
  body {
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: fixed;
  }

  body {
    @apply bg-background text-foreground;
    font-family: "M PLUS Rounded 1c", sans-serif;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
}

@layer components {
  .form-input {
    @apply w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base focus:border-[#007BFF] focus:outline-none focus:ring-2 focus:ring-[#007BFF]/20 transition-all duration-200 bg-white shadow-sm;
  }

  .form-label {
    @apply block text-base font-medium text-gray-700 mb-2;
    font-weight: 500;
  }

  .btn {
    @apply px-6 py-3 rounded-xl text-white transition-all duration-200 flex items-center justify-center gap-2 text-base font-medium shadow-sm;
  }

  .btn-primary {
    @apply bg-[#007BFF] hover:bg-[#0056b3] active:bg-[#004085] shadow-md hover:shadow-lg active:shadow;
  }

  .btn-secondary {
    @apply bg-gray-500 text-white hover:bg-gray-600 shadow-md hover:shadow-lg active:shadow;
  }

  .header {
    @apply bg-[#007BFF] text-white shadow-lg;
    padding-top: env(safe-area-inset-top);
  }

  .select-wrapper {
    @apply relative w-full;
  }

  .custom-select {
    @apply w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-base 
    shadow-sm transition-all duration-200 hover:border-gray-300 focus:border-primary 
    focus:outline-none focus:ring-2 focus:ring-primary/20;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9'/%3E%3C/svg%3E");
    background-position: right 1rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 3rem;
  }

  .select-label {
    @apply flex items-center gap-2 text-base font-medium text-gray-700 mb-2;
  }

  .card-input-wrapper {
    @apply relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200;
  }

  .card-input-wrapper.focused {
    @apply border-primary ring-2 ring-primary/20;
  }

  .confirmation-container {
    @apply space-y-6 px-4 py-6;
    max-height: calc(100vh - 180px);
    overflow-y: auto;
  }

  .confirmation-content {
    @apply bg-blue-50 p-6 rounded-2xl shadow-inner space-y-4;
  }

  .confirmation-buttons {
    @apply sticky bottom-0 pt-4 grid grid-cols-2 gap-3 bg-white;
  }

  /* モバイル最適化のための追加スタイル */
  @media (max-width: 640px) {
    .form-container {
      @apply px-4 py-4 max-w-[calc(100vw-2rem)] mx-auto;
    }

    .form-input,
    .custom-select {
      @apply text-base py-3.5 px-4;
    }

    .btn {
      @apply py-2.5 px-4 text-base;
    }

    .form-label,
    .select-label {
      @apply text-base mb-2;
    }
  }
}

