import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';
import { motion, useTransform, useScroll } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FaRobot, FaUserFriends, FaCogs } from 'react-icons/fa';
import geminiAvatar from '../assets/img/gemini.svg';

const HomePage = () => {
  const navigate = useNavigate(); // Hook di navigazione per cambiare pagina
  const [isScrolled, setIsScrolled] = useState(false); // Stato per tracciare se la pagina è scorsa
  const { scrollYProgress } = useScroll(); // Hook per monitorare lo scroll verticale
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]); // Trasforma l'opacità in base allo scroll

  // Effetto per aggiornare lo stato isScrolled in base alla posizione dello scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effetto per gestire il cursore personalizzato e le interazioni con i link
  useEffect(() => {
    const links = document.querySelectorAll('.link');
    const cursor = document.querySelector('.cursor');

    if (!cursor) {
      console.error('Elemento .cursor non trovato nel DOM');
      return;
    }

    const handleMouseEnter = () => {
      cursor.classList.add('hover');
    };

    const handleMouseLeave = () => {
      cursor.classList.remove('hover');
    };

    const handleMouseMove = (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    links.forEach(link => {
      link.addEventListener('mouseenter', handleMouseEnter);
      link.addEventListener('mouseleave', handleMouseLeave);
      link.addEventListener('mousemove', handleMouseMove);
    });

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup degli event listeners
    return () => {
      links.forEach(link => {
        link.removeEventListener('mouseenter', handleMouseEnter);
        link.removeEventListener('mouseleave', handleMouseLeave);
        link.removeEventListener('mousemove', handleMouseMove);
      });
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Funzione per navigare alla pagina di login
  const goToLogin = () => {
    navigate('/login');
  };

  // Dati per il numero di interazioni mensili
  const interactionData = [
    { name: 'Gen', interactions: 1200 },
    { name: 'Feb', interactions: 950 },
    { name: 'Mar', interactions: 1500 },
    { name: 'Apr', interactions: 1300 },
    { name: 'Mag', interactions: 1700 },
    { name: 'Giu', interactions: 1600 },
  ];

  // Dati per i tassi di risposta del chatbot
  const responseRateData = [
    { name: 'Gen', successRate: 85 },
    { name: 'Feb', successRate: 88 },
    { name: 'Mar', successRate: 90 },
    { name: 'Apr', successRate: 87 },
    { name: 'Mag', successRate: 92 },
    { name: 'Giu', successRate: 89 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Sezione principale dell'homepage */}
      <div className="homepage-section">
        <motion.header 
          className={`header ${isScrolled ? 'scrolled' : ''}`} // Header che cambia stile quando scrollato
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          {/* Navbar con il logo e i link di navigazione */}
          <nav className="navbar">
            <img src={geminiAvatar} alt="Logo" className="logo" />
            <motion.a href="#Home" className="link" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <span>Home</span>
            </motion.a>
            <motion.a href="#Features" className="link" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <span>About</span>
            </motion.a>
            <motion.a href="#Dashboard" className="link" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <span>Information</span>
            </motion.a>
          </nav>
        </motion.header>

        {/* Sezione Home con titolo, descrizione e pulsante */}
        <section id="Home" className="home">
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="home-content"
          >
            <motion.h1
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Artidax
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Scopri il potere dell'intelligenza artificiale
            </motion.p>
            <motion.button 
              className="btn bottone" 
              onClick={goToLogin} // Naviga alla pagina di login al click
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Inizia ora
            </motion.button>
          </motion.div>
        </section>
      </div>
      
      {/* Separatore visivo */}
      <div className="section-separator"></div>

      {/* Sezione scorrevole con le caratteristiche principali */}
      <div id="scroller">
        <div id="scroller-in">
          <h4>AI CHATBOT</h4>
          <h4>SMART ASSISTANT</h4>
          <h4>CUSTOMIZATION OPTIONS</h4>
          <h4>INTEGRATIONS</h4>
          <h4>SUPPORT</h4>
        </div>
        <div id="scroller-in">
          <h4>AI CHATBOT</h4>
          <h4>SMART ASSISTANT</h4>
          <h4>CUSTOMIZATION OPTIONS</h4>
          <h4>INTEGRATIONS</h4>
          <h4>SUPPORT</h4>
        </div>
      </div>

      {/* Sezione Features */}
      <section id="Features" className="features-section">
        <div className="features-grid">
          {/* Card di feature con animazioni al passaggio del mouse */}
          <motion.div className="feature-card" whileHover={{ scale: 1.05 }}>
            <FaRobot className="feature-icon" />
            <h3>Conversazioni Naturali</h3>
            <p>Il chatbot gestisce dialoghi fluidi, migliorando l'interazione con gli utenti.</p>
          </motion.div>
          <motion.div className="feature-card" whileHover={{ scale: 1.05 }}>
            <FaUserFriends className="feature-icon" />
            <h3>Apprendimento Attivo</h3>
            <p>Il chatbot si evolve continuamente, migliorando con nuove informazioni.</p>
          </motion.div>
          <motion.div className="feature-card" whileHover={{ scale: 1.05 }}>
            <FaCogs className="feature-icon" />
            <h3>Multilingue</h3>
            <p>Supporto per più lingue, facilitando l'accesso globale.</p>
          </motion.div>
          <motion.div className="feature-card" whileHover={{ scale: 1.05 }}>
            <FaCogs className="feature-icon" />
            <h3>Sicurezza</h3>
            <p>Protezione avanzata per conversazioni e dati degli utenti.</p>
          </motion.div>
        </div>
      </section>

      {/* Sezione scorrevole ripetuta */}
      <div id="scroller">
        <div id="scroller-in">
          <h4>AI CHATBOT</h4>
          <h4>SMART ASSISTANT</h4>
          <h4>CUSTOMIZATION OPTIONS</h4>
          <h4>INTEGRATIONS</h4>
          <h4>SUPPORT</h4>
        </div>
        <div id="scroller-in">
          <h4>AI CHATBOT</h4>
          <h4>SMART ASSISTANT</h4>
          <h4>CUSTOMIZATION OPTIONS</h4>
          <h4>INTEGRATIONS</h4>
          <h4>SUPPORT</h4>
        </div>
      </div>

      {/* Sezione Dashboard con due grafici */}
      <section id="Dashboard" className="dashboard-section">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="dashboard-title"
        >
        </motion.h2>
        <div className="dashboard-wrapper">
          <div className="dashboard-content">
            <motion.div 
              className="text-container"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <h3>Panoramica delle Interazioni</h3>
              <p>Monitora le interazioni del chatbot, inclusi i tassi di risposta e la soddisfazione degli utenti, per ottimizzare il servizio.</p>
            </motion.div>
            <motion.div 
              className="chart-container"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Grafico a linee per le interazioni mensili */}
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={interactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="interactions" stroke="#828282" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
          <div className="dashboard-content">
            <motion.div 
              className="text-container"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <h3>Performance Generale</h3>
              <p>Visualizza le performance del chatbot nel tempo e la distribuzione delle conversazioni per migliorare le operazioni.</p>
            </motion.div>
            <motion.div 
              className="chart-container"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Grafico a barre per i tassi di risposta */}
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={responseRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="successRate" fill="#828282" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Footer della pagina */}
      <footer className="footer">
        <div className="footer-content">
          {/* Eventuali contenuti aggiuntivi del footer */}
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Artidax. Tutti i diritti riservati.</p>
        </div>
      </footer>
      
      {/* Elemento cursore personalizzato */}
      <div className="cursor"></div>
    </motion.div>
  );
};

export default HomePage;
