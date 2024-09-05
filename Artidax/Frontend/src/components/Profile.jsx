import React, { useState, useEffect } from 'react'; // Importa React e i hook useState, useEffect per gestire lo stato e gli effetti
import axios from 'axios'; // Importa Axios per effettuare richieste HTTP

const Profile = () => {
  // Stati per gestire i dati dell'utente, il caricamento e gli errori
  const [user, setUser] = useState(null); // Stato per conservare i dati del profilo utente
  const [loading, setLoading] = useState(true); // Stato per indicare se i dati sono in fase di caricamento
  const [error, setError] = useState(null); // Stato per gestire eventuali errori durante il fetch dei dati

  // Effetto che viene eseguito al montaggio del componente per recuperare i dati del profilo utente
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token'); // Ottiene il token dal localStorage
        const response = await axios.get('http://localhost:3001/api/user', {
          headers: {
            Authorization: `Bearer ${token}` // Aggiunge il token all'intestazione della richiesta per l'autenticazione
          }
        });
        setUser(response.data); // Aggiorna lo stato con i dati del profilo utente
        setLoading(false); // Imposta il caricamento a falso una volta ottenuti i dati
      } catch (err) {
        setError('Errore durante il caricamento del profilo.'); // Imposta un messaggio di errore se il fetch fallisce
        setLoading(false); // Imposta il caricamento a falso anche in caso di errore
        console.error('Errore nel fetch del profilo:', err); // Log dell'errore per il debugging
      }
    };

    fetchProfile(); // Chiama la funzione fetchProfile al montaggio del componente
  }, []); // L'array vuoto [] indica che l'effetto deve essere eseguito solo una volta al montaggio

  // Mostra un messaggio di caricamento mentre i dati vengono recuperati
  if (loading) {
    return <div>Loading...</div>;
  }

  // Mostra un messaggio di errore se c'è stato un problema durante il fetch
  if (error) {
    return <div>{error}</div>;
  }

  // Renderizza i dati del profilo utente se disponibili
  return (
    <div>
      <h1>Profilo Utente</h1>
      {user && ( // Verifica che i dati dell'utente siano disponibili prima di mostrarli
        <div>
          <p>Email: {user.email}</p> {/* Mostra l'email dell'utente */}
          {/* Aggiungi ulteriori dettagli del profilo qui */}
        </div>
      )}
    </div>
  );
};

export default Profile; // Esporta il componente per poterlo utilizzare altrove
