
import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export function QuestionManager({ caseId }: { caseId: string }) {
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);

  const addQuestion = async () => {
    await addDoc(collection(db, `cases/${caseId}/questions`), { text, options, correctAnswerIndex });
    setText('');
    setOptions(['', '', '', '']);
    setCorrectAnswerIndex(0);
  };

  return (
    <div className="p-4 bg-white shadow rounded mt-4">
      <h2 className="text-xl font-bold mb-4">Add Question</h2>
      <input className="w-full p-2 mb-2 border rounded" placeholder="Question" value={text} onChange={e => setText(e.target.value)} />
      {options.map((option, i) => (
        <div key={i} className="flex gap-2 mb-2">
            <input className="flex-1 p-2 border rounded" placeholder={`Option ${i + 1}`} value={option} onChange={e => setOptions(prev => {
                const next = [...prev];
                next[i] = e.target.value;
                return next;
            })} />
            <input type="radio" checked={correctAnswerIndex === i} onChange={() => setCorrectAnswerIndex(i)} />
        </div>
      ))}
      <button className="bg-green-500 text-white p-2 rounded" onClick={addQuestion}>Save Question</button>
    </div>
  );
}
