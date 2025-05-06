'use client'

import styled from '@emotion/styled'
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, AuthError } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa'

import { Input } from './Input';
import { Button } from './Button';

import {
  doc,
  setDoc,
  collection, 
  query,      
  where,      
  getDocs     
} from 'firebase/firestore';

export default function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isMounted, setIsMounted] = useState(false);
   const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const router = useRouter();

  // useEffect para asegurarnos de que el código se ejecute solo en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);


  const checkIfNameExists = async (name: string) => {
    // Creamos una referencia a la colección 'users'
    const usersCollectionRef = collection(db, 'users');

    // Construimos la consulta: busca documentos en 'users' donde el campo 'name' sea igual al nombre proporcionado
    const q = query(usersCollectionRef, where('name', '==', name));

    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty; // Devuelve true si el nombre ya existe (encontró documentos), false si no
  };
  // ==========================================================================================


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setFieldErrors({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });

    let hasError = false;
    const newErrors = { ...fieldErrors };

    // Validación de nombre
    if (name.trim() === '') {
      newErrors.name = 'El nombre es obligatorio.';
      hasError = true;
    } else if (/\s/.test(name)) {
      newErrors.name = 'El nombre no puede contener espacios.';
      hasError = true;
    }
    // === Usamos la nueva función de verificación ===
    if (!hasError && await checkIfNameExists(name)) { // Solo verifica si no hay otros errores de formato en el nombre
       newErrors.name = 'Este nombre ya está en uso.';
       hasError = true;
    }
    // =============================================


    // Validación de correo
    if (!email.includes('@')) {
      newErrors.email = 'El correo electrónico no es válido.';
      hasError = true;
    }
    // Podrías añadir aquí una verificación similar para el correo si no te basta con el error de Firebase Auth

    // Validación de contraseña
    if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
      hasError = true;
    }

    // Validación de confirmación de contraseña
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Crea el usuario con el email y la contraseña en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // === Guardar detalles adicionales del usuario en Firestore usando el UID como ID del documento ===
      const userRef = doc(db, 'users', user.uid); // Referencia al documento con el UID del usuario
      await setDoc(userRef, {
          name: name.trim(), // Guarda el nombre (quizás trim() es buena idea aquí también)
          email: email.trim() // Guarda el correo (quizás trim() es buena idea aquí también)
          // Puedes añadir más campos aquí si los necesitas para el perfil del usuario
      });
      // ================================================================================================

      router.push('/login'); 
    } catch (err: unknown) {
      let errorMessage = 'Error al crear la cuenta. Intenta nuevamente.';
      if (err instanceof Error && 'code' in err) {
        const firebaseError = err as AuthError;
        switch (firebaseError.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Este correo electrónico ya está registrado con otra cuenta.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'El correo electrónico no es válido.';
            break;
          case 'auth/weak-password': // Por si acaso el lado del cliente no valida bien
             errorMessage = 'La contraseña es demasiado débil. Intenta con una más fuerte.';
             break;
          default:
            console.error("Error de Firebase Auth:", firebaseError);
            errorMessage = `Error de autenticación: ${firebaseError.message}`; // Mensaje más genérico si no es un caso conocido
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
        <Title>Crear cuenta</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            label="Nombre de usuario" // Cambiado a "Nombre de usuario" para claridad dado que lo usas para unicidad
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off" // Cambiado a off, ya que 'name' podría no ser el nombre completo real
            error={fieldErrors.name}
            disabled={loading}
          />

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
            rightIcon={
              showPassword ? (
                <FaEyeSlash onClick={() => setShowPassword(false)} />
              ) : (
                <FaEye onClick={() => setShowPassword(true)} />
              )
            }
          />

          <Input
            label="Repetir Contraseña"
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
            disabled={loading}
            rightIcon={
              showConfirmPassword ? (
                <FaEyeSlash onClick={() => setShowConfirmPassword(false)} />
              ) : (
                <FaEye onClick={() => setShowConfirmPassword(true)} />
              )
            }
          />

          {error && <Message error>{error}</Message>}

         <Button
  type="submit"
  disabled={loading}
  label={loading ? 'Enviando...' : 'Enviar'}
  icon={loading ? <FaSpinner className="animate-spin" /> : null}
  variant="primary"
/>
           <StyledLink href="/login" passHref>
  ¿Tienes cuenta? Inicia sesión aquí
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



