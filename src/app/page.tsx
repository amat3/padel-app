'use client'

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../lib/firebase'; // Asegúrate de tener esta importación configurada
import { doc, getDoc, } from 'firebase/firestore';
import UserSelect from '../components/UserSelect';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null); // Para almacenar el nombre de Firestore

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);

        // Recupera el nombre del usuario desde Firestore
        const userRef = doc(db, 'users', user.uid); // Asegúrate de tener la colección 'users'
        getDoc(userRef).then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserName(userData.name); // Guarda el nombre en el estado
          } else {
            console.log('No such document!');
          }
        });
      } else {
        setUser(null);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <main role="main">
        <h1>PADEL-APP</h1>
        {user ? (
          <div>
            <p>¡Hola, {userName}!</p>
           
            
              <button onClick={() => auth.signOut()}>Cerrar sesión</button>
            
          </div>
        ) : (
          <p>Por favor, inicia sesión.</p>
        )}
        <UserSelect />
      </main>
    </div>
  );
}
