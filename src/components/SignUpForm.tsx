'use client'

import styled from '@emotion/styled'
import { useState, useEffect } from 'react';
// Asegúrate de tener la referencia a Firebase Auth y Firestore
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, AuthError } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Input } from './Input';
// Importaciones actualizadas para consultas y guardar datos
import {
  doc,
  setDoc,
  collection, // Necesario para referenciar una colección
  query,      // Necesario para construir consultas
  where,      // Necesario para filtrar consultas
  getDocs     // Necesario para ejecutar consultas y obtener múltiples documentos
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

  const router = useRouter();

  // Usamos useEffect para asegurarnos de que el código se ejecute solo en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // === MODIFICACIÓN AQUÍ: Usamos una consulta para verificar si el campo 'name' ya existe ===
  const checkIfNameExists = async (name: string) => {
    // Creamos una referencia a la colección 'users'
    const usersCollectionRef = collection(db, 'users');

    // Construimos la consulta: busca documentos en 'users' donde el campo 'name' sea igual al nombre proporcionado
    const q = query(usersCollectionRef, where('name', '==', name));

    // Ejecutamos la consulta
    const querySnapshot = await getDocs(q);

    // Si el snapshot no está vacío, significa que encontramos al menos un documento con ese nombre
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
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            disabled={loading}
          />

          <Input
            label="Confirmar contraseña"
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
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
                Creando cuenta...
              </span>
            ) : (
              'Crear cuenta'
            )}
          </Button>
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
