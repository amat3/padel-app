'use client'

import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase'; // Asegúrate de tener la configuración de Firestore
import { collection, getDocs } from 'firebase/firestore';

type User = {
  id: string;
  name: string;
};

export default function UserSelect() {
  const [users, setUsers] = useState<User[]>([]); // Estado para almacenar los usuarios
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Estado para almacenar el usuario seleccionado

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList: User[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.name) {
            usersList.push({
              id: doc.id,
              name: data.name,
            });
          }
        });
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users: ', error);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUserId = event.target.value;
    const user = users.find((user) => user.id === selectedUserId);
    setSelectedUser(user || null); // Establece el usuario seleccionado
  };

  return (
    <div>
      <h2>Selecciona un usuario</h2>
      <select value={selectedUser?.id || ''} onChange={handleChange}>
        <option value="">Seleccionar...</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      {selectedUser && (
        <p>Has seleccionado al usuario: {selectedUser.name}</p> 
      )}
    </div>
  );
}
