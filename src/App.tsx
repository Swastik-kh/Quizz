/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon } from 'lucide-react';
import { questions as defaultQuestions, CaseData } from './questions';
import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Settings } from './components/Settings';

export default function App() {
  const [lockedNumbers, setLockedNumbers] = useState<number[]>([]);
  const [customQuestions, setCustomQuestions] = useState<{ [key: number]: CaseData }>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [viewingQuestionId, setViewingQuestionId] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const questions = { ...defaultQuestions, ...customQuestions };

  useEffect(() => {
    const docRef = doc(db, 'appState', 'global');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLockedNumbers(data.lockedNumbers || []);
        setCustomQuestions(data.customQuestions || {});
      } else {
        // Initialize if it doesn't exist
        setDoc(docRef, { lockedNumbers: [], customQuestions: {} });
      }
    });
  }, []);

  const updateLockedNumbers = async (newLockedNumbers: number[]) => {
    const docRef = doc(db, 'appState', 'global');
    try {
      await setDoc(docRef, { lockedNumbers: newLockedNumbers, customQuestions }, { merge: true });
    } catch (error) {
      console.error('Error updating locked numbers:', error);
    }
    setLockedNumbers(newLockedNumbers);
  };

  const updateCustomQuestions = async (newQuestions: { [key: number]: CaseData }) => {
    console.log('updateCustomQuestions', newQuestions);
    const docRef = doc(db, 'appState', 'global');
    try {
      await setDoc(docRef, { lockedNumbers, customQuestions: newQuestions }, { merge: true });
      console.log('Successfully updated customQuestions');
    } catch (error) {
      console.error('Error updating customQuestions:', error);
    }
    setCustomQuestions(newQuestions);
  };

  // Question view
  if (viewingQuestionId !== null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-[#FAF9F6] p-8 md:p-12 font-sans"
      >
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-neutral-100">
          <button
            onClick={() => {
              setViewingQuestionId(null);
              setSelectedNumber(null);
              setShowAnswer(false);
            }}
            className="mb-6 px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 transition"
          >
            ← पछाडि
          </button>
          
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="mb-6 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
          >
             {showAnswer ? 'प्रश्नहरू हेर्नुहोस्' : 'उत्तरहरू हेर्नुहोस्'}
          </button>

          <h2 className="text-2xl font-medium mb-6 text-neutral-800">
            प्रश्न: नम्बर {viewingQuestionId}
          </h2>
          {questions[viewingQuestionId] && (
              <>
                <p className="text-neutral-800 text-lg mb-6 p-4 bg-neutral-50 rounded-lg">
                  {questions[viewingQuestionId].description}
                </p>
                <ul className="space-y-4">
                  {(showAnswer ? questions[viewingQuestionId].answers : questions[viewingQuestionId].questions).map((q, i) => (
                    <li key={i} className="text-neutral-600 text-lg">
                      {i + 1}. {q}
                    </li>
                  ))}
                </ul>
              </>
            )}
        </div>
      </motion.div>
    );
  }

  // Main grid view
  const numbers = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleCircleClick = (num: number) => {
    if (lockedNumbers.includes(num)) {
      setViewingQuestionId(num);
    } else {
      setSelectedNumber(num);
    }
  };

  const handleLockClick = () => {
    if (selectedNumber !== null) {
      updateLockedNumbers([...lockedNumbers, selectedNumber]);
      setViewingQuestionId(selectedNumber);
      setSelectedNumber(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8 md:p-12 font-sans">
      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        customQuestions={customQuestions}
        onUpdateQuestions={updateCustomQuestions}
      />
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSettingsOpen(true)}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600"
        >
          <SettingsIcon />
        </button>
        <h1 className="text-3xl font-light text-neutral-700 mb-10 text-center tracking-tight">
          कुनै एउटा नम्बर छान्नुहोस्
        </h1>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-6 justify-items-center">
          {numbers.map((num) => (
            <div
              key={num}
              onClick={() => handleCircleClick(num)}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-medium shadow-md transition-transform hover:scale-105 hover:shadow-lg cursor-pointer ${
                (selectedNumber === num || lockedNumbers.includes(num)) ? 'bg-red-500' : 'bg-green-500'
              }`}
            >
              {num}
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center gap-4">
          {selectedNumber !== null && !lockedNumbers.includes(selectedNumber) && (
            <button
              onClick={handleLockClick}
              className="px-8 py-3 bg-neutral-800 text-white rounded-full font-medium shadow-lg hover:bg-neutral-900 transition"
            >
              Lock
            </button>
          )}
          {lockedNumbers.length > 0 && (
            <button
              onClick={() => {
                updateLockedNumbers([]);
                setSelectedNumber(null);
              }}
              className="px-8 py-3 bg-red-600 text-white rounded-full font-medium shadow-lg hover:bg-red-700 transition"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

