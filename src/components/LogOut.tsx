// src/components/LogOut.tsx
'use client';

import { useRouter } from 'next/router';
import { useCallback } from 'react';

interface LogOutProps {
  onLogout: () => Promise<void>;
}

const LogOut: React.FC<LogOutProps> = ({ onLogout }) => {
  const router = useRouter();

  const handleLogoutClient = useCallback(async () => {
    try {
      await onLogout(); // Llama a la función de logout pasada como prop
      localStorage.removeItem('userToken');
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión: ', error);
    }
  }, [onLogout, router]);

  return <button onClick={handleLogoutClient}>Cerrar sesión</button>;
};

export default LogOut;