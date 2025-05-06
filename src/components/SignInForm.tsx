'use client'

import styled from '@emotion/styled'
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';

import { Input } from './Input';
import { Button } from './Button';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });

  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

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
      router.push('/');
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
    return null;
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
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            disabled={loading}
            rightIcon={showPassword ? <FaEyeSlash /> : <FaEye />}
            onRightIconClick={() => setShowPassword((prev) => !prev)}
          />

          {error && <Message error>{error}</Message>}

          <Button
            type="submit"
            disabled={loading}
            label={loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            icon={loading ? <FaSpinner className="animate-spin" /> : null}
            variant="primary"
          />

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
