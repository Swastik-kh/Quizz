/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { questions as defaultQuestions, CaseData } from './questions';
import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Settings } from './components/Settings';
import { SpinWheel } from './components/SpinWheel';

export default function App() {
  const [lockedNumbers, setLockedNumbers] = useState<number[]>([]);
  const [customQuestions, setCustomQuestions] = useState<{ [key: number]: CaseData }>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [spinWheelOpen, setSpinWheelOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [viewingQuestionId, setViewingQuestionId] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userSelections, setUserSelections] = useState<{ [qIndex: number]: number }>({});

  useEffect(() => {
    setUserSelections({});
    setShowAnswer(false);
  }, [viewingQuestionId]);

  const questions = { ...defaultQuestions, ...customQuestions };

  useEffect(() => {
    const docRef = doc(db, 'appState', 'global');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLockedNumbers(data.lockedNumbers || []);
        setCustomQuestions(data.customQuestions || {});
      } else {
        setLockedNumbers([]);
        setCustomQuestions({});
      }
    });
  }, []);

  const updateLockedNumbers = async (newLockedNumbers: number[]) => {
    const docRef = doc(db, 'appState', 'global');
    try {
      await setDoc(docRef, { lockedNumbers: newLockedNumbers }, { merge: true });
    } catch (error) {
      console.error('Error updating locked numbers:', error);
    }
  };

  const updateCustomQuestions = async (newQuestions: { [key: number]: CaseData }) => {
    console.log('updateCustomQuestions', newQuestions);
    const docRef = doc(db, 'appState', 'global');
    try {
      await setDoc(docRef, { customQuestions: newQuestions }, { merge: true });
      console.log('Successfully updated customQuestions');
    } catch (error) {
      console.error('Error updating customQuestions:', error);
    }
  };

  // Question view
  if (viewingQuestionId !== null) {
    return (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-screen bg-[#FAF9F6] p-2 md:p-4 font-sans flex flex-col"
      >
        <div className="max-w-4xl w-full mx-auto p-4 bg-white rounded-2xl shadow-sm border border-neutral-100 flex-1 flex flex-col overflow-hidden">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setViewingQuestionId(null);
                setSelectedNumber(null);
                setShowAnswer(false);
              }}
              className="px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 transition text-sm"
            >
              ←
            </button>
            
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-sm"
            >
               {showAnswer ? 'Hide Answers' : 'Show Answers'}
            </button>
          </div>

          <h2 className="text-xl font-medium mb-3 text-neutral-800">
            Nº {viewingQuestionId}
          </h2>
          {questions[viewingQuestionId] && (
              <>
                <p className="text-neutral-800 text-sm mb-3 p-3 bg-neutral-50 rounded-lg overflow-y-auto">
                  {questions[viewingQuestionId].description}
                </p>
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {(Array.isArray(questions[viewingQuestionId].questions) && typeof questions[viewingQuestionId].questions[0] === 'object' 
                    ? (questions[viewingQuestionId].questions as any[]).map((q, qIndex) => (
                      <div key={qIndex} className="p-3 border rounded-lg">
                        <p className="font-medium text-sm mb-2">{q.text}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((option: string, oIndex: number) => (
                            <button
                              key={oIndex}
                              onClick={() => !showAnswer && setUserSelections(prev => ({ ...prev, [qIndex]: oIndex }))}
                              disabled={showAnswer}
                              className={`p-1.5 border rounded text-left transition text-xs ${
                                userSelections[qIndex] === oIndex
                                  ? oIndex === q.correctAnswerIndex
                                    ? 'bg-green-100 border-green-700 text-green-800' // Selected Correct
                                    : 'bg-red-100 border-red-700 text-red-800'        // Selected Incorrect
                                  : (showAnswer && oIndex === q.correctAnswerIndex)
                                    ? 'bg-green-100 border-green-700 text-green-800' // Revealed Correct
                                    : 'bg-neutral-50 hover:bg-neutral-100'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                    : (questions[viewingQuestionId].questions as string[]).map((q, qIndex) => (
                      <div key={qIndex} className="p-3 border rounded-lg">
                        <p className="font-medium text-sm mb-2">{qIndex + 1}. {q}</p>
                        {showAnswer && (
                          <div className="bg-green-100 border border-green-500 p-2 rounded mt-2 text-xs">
                            {(questions[viewingQuestionId] as any).answers[qIndex]}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
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
      <SpinWheel
        isOpen={spinWheelOpen}
        onClose={() => setSpinWheelOpen(false)}
        lockedNumbers={lockedNumbers}
        onNumberSelected={(num) => {
          updateLockedNumbers([...lockedNumbers, num]);
          setViewingQuestionId(num);
        }}
      />
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSettingsOpen(true)}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600"
        >
          <SettingsIcon />
        </button>
        <button
          onClick={() => setSpinWheelOpen(true)}
          className="absolute top-4 left-4 p-2 text-neutral-400 hover:text-neutral-600 flex items-center gap-1"
        >
          <Sparkles size={20} /> Spin
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

