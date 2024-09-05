import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const useAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [navigate]);

  return localStorage.getItem('token') !== null; // Ritorna true se il token è presente
};

export default useAuth;
