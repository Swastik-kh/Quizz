
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export function CaseManager() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const addCase = async () => {
    await addDoc(collection(db, 'cases'), { title, description });
    setTitle('');
    setDescription('');
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Add Case</h2>
      <input className="w-full p-2 mb-2 border rounded" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea className="w-full p-2 mb-2 border rounded" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <button className="bg-blue-500 text-white p-2 rounded" onClick={addCase}>Save Case</button>
    </div>
  );
}
