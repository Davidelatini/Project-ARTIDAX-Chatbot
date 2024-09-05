import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Chatbot.css'; // Importa gli stili CSS per il componente
import { useNavigate } from 'react-router-dom'; // Importa il hook per la navigazione
import geminiAvatar from '../assets/img/gemini.svg'; // Avatar del bot
import userAvatar from '../assets/img/profile.png'; // Avatar dell'utente
import axios from 'axios'; // Importa Axios per le richieste HTTP

const Chatbot = () => {
  const [userMessage, setUserMessage] = useState(''); // Messaggio dell'utente
  const [conversations, setConversations] = useState([]); // Elenco delle conversazioni
  const [isResponseGenerating, setIsResponseGenerating] = useState(false); // Stato per il caricamento delle risposte del bot
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // Stato per il menu utente
  const [activeChatIndex, setActiveChatIndex] = useState(() => {
    const savedIndex = localStorage.getItem('activeChatIndex');
    return savedIndex !== null ? parseInt(savedIndex, 10) : null;
  });
  const [showSuggestions, setShowSuggestions] = useState(localStorage.getItem('showSuggestions') !== 'false'); // Stato per mostrare i suggerimenti
  const [isChatVisible, setIsChatVisible] = useState(true); // Stato per la visibilità della chat
  const chatContainer = useRef(null); // Riferimento al contenitore della chat per lo scrolling
  const navigate = useNavigate(); // Hook per la navigazione tra le pagine
  const API_KEY = "AIzaSyD9dwQ9ZmYKjx93Lhdszr_nIbgGQilpjmk"; // Chiave API per l'interazione con l'API
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`; // URL API per generare contenuti
  const BACKEND_URL = 'http://localhost:3001/api/conversations'; // URL backend per la gestione delle conversazioni

  // Flag per impedire inizializzazioni multiple
  let isFetchingConversations = false;

  const fetchConversations = useCallback(async () => {
    if (isFetchingConversations) return; // Evita chiamate multiple
    isFetchingConversations = true; // Imposta il flag a true per prevenire altre chiamate

    try {
      let token = localStorage.getItem('token');
      if (!token) {
        token = await refreshAccessToken(); // Rinnova il token se manca
      }

      const response = await axios.get(BACKEND_URL, {
        headers: {
          'Authorization': `Bearer ${token}` // Aggiunge il token all'intestazione della richiesta
        }
      });
      setConversations(response.data); // Aggiorna lo stato delle conversazioni

      // Crea una nuova chat solo se non ci sono conversazioni
      if (response.data.length === 0) {
        await startNewChat();
      }
    } catch (error) {
      console.error('Errore durante il caricamento delle conversazioni:', error);
    } finally {
      isFetchingConversations = false; // Resetta il flag
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (chatContainer.current) {
      chatContainer.current.scrollTo(0, chatContainer.current.scrollHeight);
    }
  }, [conversations, activeChatIndex]);

  useEffect(() => {
    if (activeChatIndex !== null) {
      localStorage.setItem('activeChatIndex', activeChatIndex);
    }
  }, [activeChatIndex]);

  const handleOutgoingChat = async (e) => {
    e.preventDefault(); // Previene il comportamento predefinito del form
    if (!userMessage.trim() || isResponseGenerating || activeChatIndex === null || activeChatIndex >= conversations.length || !isChatVisible) return;

    const newMessage = { text: userMessage, sender: 'user', loading: false };

    setConversations((prevConversations) => {
      const updatedConversations = [...prevConversations];
      if (updatedConversations[activeChatIndex]) {
        updatedConversations[activeChatIndex].messages.push(newMessage);
        updatedConversations[activeChatIndex].showHeader = false;
      }
      return updatedConversations;
    });

    setUserMessage(''); // Resetta l'input del messaggio
    setShowSuggestions(false); // Nasconde i suggerimenti
    localStorage.setItem('showSuggestions', 'false'); // Salva la preferenza nel localStorage
    setIsResponseGenerating(true); // Imposta lo stato di caricamento

    try {
      let token = localStorage.getItem('token');
      if (!token) {
        token = await refreshAccessToken(); // Rinnova il token se manca
      }

      const response = await axios.post(`${BACKEND_URL}/${conversations[activeChatIndex]._id}/messages`, 
        { text: userMessage, sender: 'user' },
        {
          headers: {
            'Authorization': `Bearer ${token}`, // Aggiunge il token all'intestazione della richiesta
          }
        }
      );

      if (response.status === 403) {
        console.error('Accesso non autorizzato. Provo a rinnovare il token.');
        const newToken = await refreshAccessToken();
        if (!newToken) return;

        const retryResponse = await axios.post(`${BACKEND_URL}/${conversations[activeChatIndex]._id}/messages`, 
          { text: userMessage, sender: 'user' },
          {
            headers: {
              'Authorization': `Bearer ${newToken}`,
            }
          }
        );
        setConversations((prevConversations) => {
          const updatedConversations = [...prevConversations];
          if (updatedConversations[activeChatIndex]) {
            updatedConversations[activeChatIndex].messages = retryResponse.data.messages;
          }
          return updatedConversations;
        });
      } else {
        const data = response.data;
        setConversations((prevConversations) => {
          const updatedConversations = [...prevConversations];
          if (updatedConversations[activeChatIndex]) {
            updatedConversations[activeChatIndex].messages = data.messages;
          }
          return updatedConversations;
        });

        await generateAPIResponse(); // Genera la risposta del bot
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento della conversazione:", error);
    } finally {
      setIsResponseGenerating(false); // Imposta lo stato di caricamento a falso
    }
  };

  const generateAPIResponse = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: userMessage }] }]
        })
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Errore durante la generazione della risposta API:', data.error?.message || 'Errore sconosciuto');
        throw new Error(data.error?.message || 'Errore sconosciuto');
      }

      const data = await response.json();
      const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
      addBotResponse(apiResponse);
    } catch (error) {
      console.error('Errore durante la generazione della risposta API:', error.message);
      setConversations((prevConversations) => {
        const updatedConversations = [...prevConversations];
        if (updatedConversations[activeChatIndex]) {
          updatedConversations[activeChatIndex].messages.push({ text: 'Si è verificato un errore durante la generazione della risposta.', sender: 'bot', error: true, loading: false });
        }
        return updatedConversations;
      });
    }
  };

  const improvePrompt = () => {
    const improvedMessage = `Migliorato: ${userMessage}...`;
    setUserMessage(improvedMessage);
  };

  const addBotResponse = (text, isError = false) => {
    setConversations((prevConversations) => {
      const updatedConversations = [...prevConversations];
      const messages = updatedConversations[activeChatIndex].messages;

      if (messages.length > 0 && messages[messages.length - 1].text === text && messages[messages.length - 1].sender === 'bot') {
        return updatedConversations;
      }

      messages.push({ text, sender: 'bot', error: isError, loading: false });
      return updatedConversations;
    });

    try {
      fetch(`${BACKEND_URL}/${conversations[activeChatIndex]._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text, sender: 'bot' }),
      });
    } catch (error) {
      console.error("Errore durante l'aggiornamento della conversazione con la risposta:", error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setUserMessage(suggestion);
  };

  const clearChatContent = (index) => {
    setConversations((prevConversations) => {
      const updatedConversations = [...prevConversations];
      if (updatedConversations[index]) {
        updatedConversations[index].messages = [];
      }
      return updatedConversations;
    });
  };

  const toggleChatVisibility = () => {
    setIsChatVisible(prev => !prev);
  };

  const startNewChat = async () => {
    try {
      const chatName = `Chat ${conversations.length + 1}`;
      let token = localStorage.getItem('token');
      if (!token) {
        token = await refreshAccessToken();
      }

      const response = await fetch(`${BACKEND_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ chatName, showHeader: true })
      });

      if (!response.ok) {
        console.error('Errore durante la creazione della nuova chat:', response.statusText);
        throw new Error('Errore durante la creazione della nuova chat');
      }

      const newChat = await response.json();
      newChat.showHeader = true;
      setConversations((prevConversations) => [...prevConversations, newChat]);
      setActiveChatIndex(conversations.length);
      localStorage.setItem('showSuggestions', 'true');
      setShowSuggestions(true);
    } catch (error) {
      console.error('Errore durante la creazione della nuova chat:', error);
    }
  };

  const openChat = (index) => {
    setActiveChatIndex(index);
  };

  const renameChat = async (index) => {
    const newName = prompt('Inserisci un nuovo nome per la chat:');
    if (newName) {
      try {
        let token = localStorage.getItem('token');
        if (!token) {
          token = await refreshAccessToken();
        }

        await fetch(`${BACKEND_URL}/${conversations[index]._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ chatName: newName }),
        });

        setConversations((prevConversations) => {
          const updatedConversations = [...prevConversations];
          updatedConversations[index].chatName = newName;
          return updatedConversations;
        });
      } catch (error) {
        console.error('Errore durante il rinomina della chat:', error);
      }
    }
  };

  const deleteChat = async (index) => {
    try {
      const chatId = conversations[index]._id;
      let token = localStorage.getItem('token');
      if (!token) {
        token = await refreshAccessToken();
      }

      const response = await fetch(`${BACKEND_URL}/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        console.error('Chat non trovata per ID:', chatId);
        return;
      }

      if (!response.ok) {
        console.error('Errore durante l\'eliminazione della chat:', response.statusText);
        throw new Error('Errore durante l\'eliminazione della chat');
      }

      setConversations((prevConversations) => prevConversations.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Errore durante l\'eliminazione della chat:', error);
    }
  };

  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/HomePage'); // Naviga alla homepage
  };

  return (
    <div className="Chatbots">
      <div id="nav-column">
        <div className="butt">
          <button onClick={startNewChat}>
            <span id="improve-prompt-button" className="material-symbols-outlined" onClick={improvePrompt}></span>
            <span className="material-symbols-outlined">add_circle</span>
            <h6>Nuova Chat</h6>
          </button>
        </div>
        <div id="previous-chats">
          {conversations.map((chat, index) => (
            <div
              key={index}
              className={`chat-item ${activeChatIndex === index ? 'active' : ''}`}
              onClick={() => openChat(index)}
            >
              {chat.chatName || `Chat ${index + 1}`}
              <div className="butto">
                <button onClick={(e) => { e.stopPropagation(); renameChat(index); }}>
                  <span className="material-symbols-outlined">edit_note</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteChat(index); }}>
                  <span id="delete-chat-button" className="icon material-symbols-rounded">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="user-menu-container">
        <button onClick={toggleUserMenu} className="user-menu-toggle">
          <span className="material-symbols-outlined">person</span>
        </button>
        {isUserMenuOpen && (
          <div className="user-menu">
            <button onClick={() => navigate('/edit-profile')}>Modifica Profilo</button>
            <button onClick={handleLogout}>Esci</button>
          </div>
        )}
      </div>

      <div className="chat-content">
        {activeChatIndex !== null && conversations[activeChatIndex] && conversations[activeChatIndex].showHeader && (
          <header className="headers">
            <h1 className="title">Ciao, benvenuto</h1>
            <p className="subtitle">Come posso aiutarti oggi?</p>
            <ul className="suggestion-list">
              <li className="suggestion" onClick={() => handleSuggestionClick('Aiutami a organizzare una serata di giochi con i miei 5 migliori amici per meno di 100€.')}>
                <h4 className="text">Aiutami a organizzare una serata di giochi con i miei 5 migliori amici per meno di 100€.</h4>
                <span className="icon material-symbols-rounded">draw</span>
              </li>
              <li className="suggestion" onClick={() => handleSuggestionClick('Quali sono i migliori consigli per migliorare le mie abilità di parlare in pubblico?')}>
                <h4 className="text">Quali sono i migliori consigli per migliorare le mie abilità di parlare in pubblico?</h4>
                <span className="icon material-symbols-rounded">lightbulb</span>
              </li>
              <li className="suggestion" onClick={() => handleSuggestionClick('Puoi aiutarmi a trovare le ultime notizie sullo sviluppo web?')}>
                <h4 className="text">Puoi aiutarmi a trovare le ultime notizie sullo sviluppo web?</h4>
                <span className="icon material-symbols-rounded">explore</span>
              </li>
              <li className="suggestion" onClick={() => handleSuggestionClick('Scrivi un codice JavaScript per sommare tutti gli elementi in un array.')}>
                <h4 className="text">Scrivi un codice JavaScript per sommare tutti gli elementi in un array.</h4>
                <span className="icon material-symbols-rounded">code</span>
              </li>
            </ul>
          </header>
        )}

        <div className="chat-list" ref={chatContainer} style={{ display: isChatVisible ? 'block' : 'none' }}>
          {activeChatIndex !== null && conversations[activeChatIndex] && conversations[activeChatIndex].messages.map((chat, index) => (
            <div key={index} className={`message ${chat.sender} ${chat.error ? 'error' : ''}`}>
              <div className="message-content">
                <img 
                  className={`avatar ${isResponseGenerating && chat.sender === 'bot' ? 'rotate-animation loading-icon' : ''}`} 
                  src={chat.sender === 'user' ? userAvatar : geminiAvatar} 
                  alt="Avatar" 
                />

                {chat.loading ? (
                  <div className="dots-container loading-icon">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                ) : (
                  <p className="text">{chat.text}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="typing-area">
          <form className="typing-form" onSubmit={handleOutgoingChat}>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Inserisci un suggerimento qui"
                className="typing-input"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                required={isChatVisible}
              />
              <div className="action-buttons">
                {/* Spazio per eventuali pulsanti azione */}
              </div>
            </div>
          </form>
          <p className="disclaimer-text">
            Artidax potrebbe mostrare informazioni inaccurate, incluse quelle sulle persone, quindi verifica sempre le sue risposte.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
