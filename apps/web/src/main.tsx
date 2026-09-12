import React from 'react';
import { createRoot } from 'react-dom/client';
import { Chat } from './components/Chat';
import './styles.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><Chat/></React.StrictMode>);
