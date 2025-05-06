'use client'

import styled from '@emotion/styled'
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


import { Input } from './Input';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });

  const [isMounted, setIsMounted] = useState(false); // Para asegurarse de que el código solo se ejecute en el cliente

  const router = useRouter();

  // Usamos useEffect para asegurarnos de que el código se ejecute solo en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setFieldErrors({
      email: '',
      password: '',
    });

    let hasError = false;
    const newErrors = { ...fieldErrors };

    if (!email.includes('@')) {
      newErrors.email = 'El correo electrónico no es válido.';
      hasError = true;
    }

    if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/'); // Redirige al dashboard después del login
    } catch (err: unknown) {
      let errorMessage = 'Error al iniciar sesión. Intenta nuevamente.';
      if (err instanceof Error && 'code' in err) {
        const firebaseError = err as AuthError;
        switch (firebaseError.code) {
          case 'auth/wrong-password':
            errorMessage = 'La contraseña es incorrecta.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No hay ningún usuario registrado con este correo electrónico.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'El correo electrónico no es válido.';
            break;
          default:
            console.error("Error de Firebase Auth:", firebaseError);
        }
      } else {
        console.error("Error desconocido:", err);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return null; // Evitar el renderizado en el servidor hasta que se monte en el cliente
  }

  return (
    <Container>
      <Wrapper>
        <Title>Iniciar sesión</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            label="Correo electrónico"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            error={fieldErrors.email}
            disabled={loading}
          />

          <Input
            label="Contraseña"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            disabled={loading}
          />

          {error && <Message error>{error}</Message>}

          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar sesión'
            )}
          </Button>
          <StyledLink href="/reset-password" passHref>
  ¿Olvidaste tu contraseña?
</StyledLink>

          <StyledLink href="/register" passHref>
  ¿No tienes cuenta? Regístrate aquí
</StyledLink>
        </Form>
      </Wrapper>
    </Container>
  );
}

// --- Estilos ---
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #2f415a 0%, #6fa17b 100%);
  font-family: 'Roboto', sans-serif;
`;

const Wrapper = styled.div`
  width: 100%;
  max-width: 28rem;
  margin: 2.5rem auto 0;
  padding: 1.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #2d3748;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
`;

const Message = styled.p<{ error?: boolean }>`
  font-size: 0.875rem;
  text-align: center;
  color: ${({ error }) => (error ? '#e53e3e' : '#38a169')};
`;

const StyledLink = styled(Link)`
  font-size: 0.875rem;
  color: #5a67d8;
  text-align: center;
  margin-top: 1rem;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;


const Button = styled.button<{ loading?: boolean }>`
  width: fit-content;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  background-color: ${({ loading }) => (loading ? '#7f9cf5' : '#5a67d8')};
  cursor: ${({ loading }) => (loading ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s ease-in-out;
  &:hover {
    background-color: ${({ loading }) => (loading ? '#7f9cf5' : '#434190')};
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(90, 103, 216, 0.5);
  }
`;
