import React, { useState, useEffect } from 'react'; // Importa React e i hook useState, useEffect
import axios from 'axios'; // Importa Axios per effettuare richieste HTTP
import { useNavigate } from 'react-router-dom'; // Importa useNavigate per la navigazione tra le pagine
import './EditProfile.css'; // Importa i tuoi stili personalizzati

function EditProfile() {
  // Stati per email, password, messaggio di feedback e tipo di messaggio
  const [email, setEmail] = useState(''); // Stato per l'email dell'utente
  const [password, setPassword] = useState(''); // Stato per la password dell'utente
  const [message, setMessage] = useState(''); // Stato per il messaggio di feedback
  const [messageType, setMessageType] = useState(''); // Stato per il tipo di messaggio (successo o errore)
  const navigate = useNavigate(); // Hook per navigare tra le pagine

  // Effetto per caricare i dati del profilo utente al montaggio del componente
  useEffect(() => {
    // Effettua una richiesta GET per ottenere i dati del profilo
    axios.get('http://localhost:3001/api/user', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Aggiunge il token all'intestazione della richiesta
      }
    })
      .then(result => {
        setEmail(result.data.email); // Aggiorna lo stato con l'email ricevuta dal backend
      })
      .catch(err => {
        // Gestisce gli errori della richiesta GET
        if (err.response && err.response.data.message) {
          setMessage(err.response.data.message); // Imposta il messaggio di errore
          setMessageType('error'); // Imposta il tipo di messaggio a 'error'
        }
      });
  }, []); // L'array vuoto [] indica che l'effetto deve essere eseguito solo una volta al montaggio

  // Funzione di gestione dell'invio del form per aggiornare il profilo
  const handleSubmit = (e) => {
    e.preventDefault(); // Previene il comportamento predefinito del form

    // Effettua una richiesta PUT per aggiornare il profilo
    axios.put('http://localhost:3001/api/user', { email, password }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Aggiunge il token all'intestazione della richiesta
      }
    })
      .then(result => {
        setMessage('Profilo aggiornato con successo'); // Imposta il messaggio di successo
        setMessageType('success'); // Imposta il tipo di messaggio a 'success'
      })
      .catch(err => {
        // Gestisce gli errori della richiesta PUT
        if (err.response && err.response.data.message) {
          setMessage(err.response.data.message); // Imposta il messaggio di errore
          setMessageType('error'); // Imposta il tipo di messaggio a 'error'
        }
      });
  };

  // Renderizza il modulo di modifica del profilo
  return (
    <div className='edit-profile-container'> {/* Contenitore principale del modulo */}
      <div className='edit-profile-box'> {/* Box del modulo di modifica profilo */}
        <h2>Edit Profile</h2> {/* Titolo del modulo */}
        <form className='form-control' onSubmit={handleSubmit}> {/* Form di modifica profilo */}
          <div>
            <label>Email</label> {/* Label per l'email */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Aggiorna lo stato dell'email quando cambia
            />
          </div>
          <div>
            <label>Password</label> {/* Label per la password */}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Aggiorna lo stato della password quando cambia
            />
          </div>
          <button type="submit">Aggiorna account</button> {/* Bottone per inviare il form */}
          <button type="button" onClick={() => navigate('/delete-account')}>Elimina Account</button> {/* Bottone per navigare alla pagina di eliminazione account */}
          <button type="button" onClick={() => navigate('/chatbot')}>Ritorna al Chatbot</button> {/* Bottone per tornare alla pagina del chatbot */}
          {message && <p className={messageType === 'success' ? 'success-message' : 'error-message'}>{message}</p>} {/* Mostra il messaggio di feedback con stile condizionato */}
        </form>
      </div>
    </div>
  );
}

export default EditProfile; // Esporta il componente per poterlo utilizzare altrove
