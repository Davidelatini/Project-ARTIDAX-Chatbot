import React, { useState } from 'react'; // Importa React e useState per gestire lo stato
import axios from 'axios'; // Importa Axios per effettuare richieste HTTP
import { useNavigate } from 'react-router-dom'; // Importa useNavigate per la navigazione tra le pagine
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa gli stili di Bootstrap
import './Login.css'; // Importa i tuoi stili personalizzati

function Register() {
  // Stati per email, password e messaggio di feedback
  const [email, setEmail] = useState(''); // Stato per l'email dell'utente
  const [password, setPassword] = useState(''); // Stato per la password dell'utente
  const [message, setMessage] = useState(''); // Stato per il messaggio di feedback
  const navigate = useNavigate(); // Hook per navigare tra le pagine

  // Funzione di gestione dell'invio del form di registrazione
  const handleSubmit = (e) => {
    e.preventDefault(); // Previene il comportamento predefinito del form

    // Validazione dei campi email e password
    if (!email || !password) {
      setMessage('Per favore, inserisci tutti i campi'); // Messaggio di errore se i campi sono vuoti
      return;
    }

    // Validazione del formato dell'email
    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage('Per favore, inserisci un indirizzo email valido'); // Messaggio di errore se l'email non è valida
      return;
    }

    // Validazione della lunghezza della password
    if (password.length < 6) {
      setMessage('La password deve essere lunga almeno 6 caratteri'); // Messaggio di errore se la password è troppo corta
      return;
    }

    // Invia i dati di registrazione al backend
    axios.post('http://localhost:3001/api/auth/register', { email, password })
      .then(result => {
        setMessage(result.data.message); // Mostra il messaggio di risposta dal backend
        if (result.data.message === 'Registrazione avvenuta con successo') {
          navigate('/login'); // Naviga alla pagina di login se la registrazione è avvenuta con successo
        }
      })
      .catch(err => {
        // Gestione degli errori di registrazione dal backend
        if (err.response && err.response.data.message) {
          setMessage(err.response.data.message); // Mostra il messaggio di errore specifico dal backend
        }
      });
  }

  // Renderizza il modulo di registrazione
  return (
    <div className='login-container'> {/* Contenitore principale del modulo */}
      <div className='login-box'> {/* Box del modulo di registrazione */}
        <h2>Registrati</h2> {/* Titolo del modulo */}
        <form onSubmit={handleSubmit}> {/* Form di registrazione */}
          <div className='mb-3'>
            <label htmlFor="email"><strong>Email</strong></label> {/* Label per l'email */}
            <input 
              type="email" 
              placeholder='Enter Email' 
              autoComplete='off' 
              name='email' 
              className='form-control rounded-0' 
              onChange={(e) => setEmail(e.target.value)} // Aggiorna lo stato dell'email quando cambia
            />
          </div>
          <div className='mb-3'>
            <label htmlFor="password"><strong>Password</strong></label> {/* Label per la password */}
            <input 
              type="password" 
              placeholder='Enter Password' 
              name='password' 
              className='form-control rounded-0' 
              onChange={(e) => setPassword(e.target.value)} // Aggiorna lo stato della password quando cambia
            />
          </div>
          <button type='submit' className='btn btn-success w-100 rounded-0'>Registrati</button> {/* Bottone per inviare il form */}
          {message && <p className='message'>{message}</p>} {/* Mostra il messaggio di feedback */}
          <div className='create-account'>
            <button 
              type='button' 
              className='btn btn-default w-100 rounded-0 mt-2' 
              onClick={() => navigate('/login')} // Naviga alla pagina di login
            >
              Torna al Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register; // Esporta il componente per poterlo utilizzare altrove
