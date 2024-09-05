import React, { useState } from 'react'; // Importa React e useState per gestire lo stato
import axios from 'axios'; // Importa Axios per le richieste HTTP
import { useNavigate } from 'react-router-dom'; // Importa useNavigate per la navigazione tra le pagine
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa gli stili di Bootstrap
import './Login.css'; // Importa i tuoi stili personalizzati


function Login() {
  // Stati per email, password e messaggio di errore o successo
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Hook per navigare tra le pagine

  // Gestore del submit del form
  const handleSubmit = (e) => {
    e.preventDefault(); // Previene il comportamento predefinito di invio del form

    // Validazione dei campi
    if (!email || !password) {
      setMessage('Per favore, inserisci tutti i campi'); // Messaggio di errore se i campi sono vuoti
      return;
    }

    // Validazione dell'indirizzo email
    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage('Per favore, inserisci un indirizzo email valido'); // Messaggio di errore se l'email non è valida
      return;
    }

    // Invio delle credenziali al server
    axios.post('http://localhost:3001/api/auth/login', { email, password })
      .then(result => {
        setMessage(result.data.message); // Mostra il messaggio ricevuto dal server
        if (result.data.message === 'Login successo') {
          localStorage.setItem('token', result.data.token); // Salva il token nel localStorage
          navigate('/Chatbot'); // Naviga alla pagina del chatbot
        }
      })
      .catch(err => {
        console.error('Login error:', err); // Log dell'errore per il debugging
        if (err.response && err.response.data.message) {
          setMessage(err.response.data.message); // Mostra il messaggio di errore dal server
        } else {
          setMessage('Errore durante il login. Riprova più tardi.'); // Messaggio di errore generico
        }
      });
  }

  return (
    // Contenitore principale con immagine di sfondo applicata
    <div 
      className='login-container' 
      
    >
      {/* Box di login */}
      <div className='login-box'>
        <h2>Accedi</h2>
        <form onSubmit={handleSubmit}>
          {/* Campo per l'email */}
          <div className='mb-3'>
            <label htmlFor="email"><strong>Email</strong></label>
            <input 
              type="email" 
              placeholder='Enter Email' 
              autoComplete='off' 
              name='email' 
              className='form-control rounded-0' 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          {/* Campo per la password */}
          <div className='mb-3'>
            <label htmlFor="password"><strong>Password</strong></label>
            <input 
              type="password" 
              placeholder='Enter Password' 
              name='password' 
              className='form-control rounded-0' 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          {/* Bottone per inviare il form */}
          <button type='submit' className='btn btn-success w-100 rounded-0'>Continua</button>
          {/* Messaggio di errore o successo */}
          {message && <p className='message'>{message}</p>}
          <p>You agree to our terms and policies</p>
          {/* Bottone per registrarsi */}
          <div className='create-account'>
            <button 
              type='button' 
              className='btn btn-default w-100 rounded-0' 
              onClick={() => navigate('/register')} // Naviga alla pagina di registrazione
            >
              Crea il tuo account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login; // Esporta il componente per poterlo utilizzare altrove
