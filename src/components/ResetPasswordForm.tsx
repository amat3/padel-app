'use client';

import styled from '@emotion/styled';
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';

export default function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!email.includes('@')) {
      setError('Por favor ingresa un correo válido.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Te hemos enviado un correo para restablecer tu contraseña.');
    } catch (err) {
      console.error(err);
      setError('No pudimos enviar el correo. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Wrapper>
        <Title>Recuperar contraseña</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu correo electrónico"
            disabled={loading}
          />
          {error && <Message error>{error}</Message>}
          {message && <Message>{message}</Message>}

          <Button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar correo de recuperación'}
          </Button>
        </Form>

        <StyledLink href="/login" passHref>
          Volver al inicio de sesión
        </StyledLink>
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
  background: linear-gradient(135deg, #2f415a 0%, #6fa17b 100%);
`;

const Wrapper = styled.div`
  width: 100%;
  max-width: 28rem;
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: #2d3748;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 0.375rem;
  font-size: 1rem;
`;

const Message = styled.p<{ error?: boolean }>`
  font-size: 0.875rem;
  text-align: center;
  color: ${({ error }) => (error ? '#e53e3e' : '#38a169')};
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: #5a67d8;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #434190;
  }
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
