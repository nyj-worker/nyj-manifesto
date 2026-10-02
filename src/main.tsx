import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initClientStorage } from './services/clientStorage.ts';

// 앱 시작 시 로컬스토리지 시드 데이터 즉시 자가 복구 및 초기화
initClientStorage();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
