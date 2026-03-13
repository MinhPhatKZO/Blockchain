import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 1. Import Bootstrap trước (để dùng cho các component cũ)
import 'bootstrap/dist/css/bootstrap.min.css';

// 2. Import Tailwind CSS (File này chứa @tailwind base, components, utilities)
// QUAN TRỌNG: Phải import sau Bootstrap để Tailwind có thể ghi đè/bổ sung style
import './index.css'; 

// TypeScript cần ép kiểu 'HTMLElement' cho root
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);