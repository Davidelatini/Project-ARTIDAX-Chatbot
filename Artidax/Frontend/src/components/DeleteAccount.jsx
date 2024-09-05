import React, { useState } from 'react'; // Importa React e il hook useState per gestire lo stato
import axios from 'axios'; // Importa Axios per effettuare richieste HTTP
import { useNavigate } from 'react-router-dom'; // Importa useNavigate per la navigazione tra le pagine
import './DeleteAccount.css'; // Importa i tuoi stili personalizzati

function DeleteAccount() {
  // Stato per gestire il messaggio di feedback
  const [message, setMessage] = useState(''); // Stato per il messaggio di feedback
  const navigate = useNavigate(); // Hook per navigare tra le pagine

  // Funzione di gestione per eliminare l'account
  const handleDelete = () => {
    // Effettua una richiesta DELETE per eliminare l'account
    axios.delete('http://localhost:3001/api/user', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Aggiunge il token all'intestazione della richiesta
      }
    })
      .then(result => {
        setMessage('Account eliminato con successo'); // Imposta il messaggio di successo
        localStorage.removeItem('token'); // Rimuove il token dal localStorage
        navigate('/register'); // Naviga alla pagina di registrazione
      })
      .catch(err => {
        // Gestisce gli errori della richiesta DELETE
        if (err.response && err.response.data.message) {
          setMessage(err.response.data.message); // Imposta il messaggio di errore
        }
      });
  };

  // Renderizza il modulo di eliminazione dell'account
  return (
    <div className='delete-account-container'> {/* Contenitore principale del modulo */}
      <div className='deleted'> {/* Box per il contenuto della conferma di eliminazione */}
        <h2>Sicuro di voler eliminare l'account?</h2> {/* Titolo del modulo */}
        <div className='button'> {/* Contenitore per i pulsanti */}
          <button onClick={handleDelete}>Elimina</button> {/* Bottone per eliminare l'account */}
          <button type="button" onClick={() => navigate('/chatbot')}>Ritorna al chatbot</button> {/* Bottone per tornare al chatbot */}
          {message && <p>{message}</p>} {/* Mostra il messaggio di feedback */}
        </div>
      </div>
    </div>
  );
}

export default DeleteAccount; // Esporta il componente per poterlo utilizzare altrove
