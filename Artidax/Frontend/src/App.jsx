// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import Chatbot from './components/Chatbot';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile'; // Importa il componente Profilo
import EditProfile from './components/EditProfile'; // Importa il componente Modifica Profilo
import DeleteAccount from './components/DeleteAccount'; // Importa il componente Elimina Account


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Aggiungi questa linea per risolvere l'errore */}
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Chatbot" element={<Chatbot />} />
        <Route path="/profile" element={<Profile />} /> {/* Aggiungi la rotta per il profilo */}
        <Route path="/edit-profile" element={<EditProfile />} /> {/* Aggiungi la rotta per modifica profilo */}
        <Route path="/delete-account" element={<DeleteAccount />} /> {/* Aggiungi la rotta per eliminare account */}
        <Route path="*" element={<HomePage />} /> {/* Opzionale: rotta fallback per gestire tutte le altre rotte */}
      </Routes>
    </Router>
  );
}

export default App;
