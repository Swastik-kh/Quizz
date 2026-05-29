/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { questions } from './questions';

export default function App() {
  const [lockedNumber, setLockedNumber] = useState<number | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Question view
  if (lockedNumber !== null) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] p-8 md:p-12 font-sans">
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-neutral-100">
          <button
            onClick={() => {
              setLockedNumber(null);
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
            प्रश्न: नम्बर {lockedNumber}
          </h2>
          {questions[lockedNumber] && (
              <>
                <p className="text-neutral-800 text-lg mb-6 p-4 bg-neutral-50 rounded-lg">
                  {questions[lockedNumber].description}
                </p>
                <ul className="space-y-4">
                  {(showAnswer ? questions[lockedNumber].answers : questions[lockedNumber].questions).map((q, i) => (
                    <li key={i} className="text-neutral-600 text-lg">
                      {i + 1}. {q}
                    </li>
                  ))}
                </ul>
              </>
            )}
        </div>
      </div>
    );
  }

  // Main grid view
  const numbers = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleCircleClick = (num: number) => {
    setSelectedNumber(num);
  };

  const handleLockClick = () => {
    if (selectedNumber !== null) {
      setLockedNumber(selectedNumber);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-light text-neutral-700 mb-10 text-center tracking-tight">
          कुनै एउटा नम्बर छान्नुहोस्
        </h1>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-6 justify-items-center">
          {numbers.map((num) => (
            <div
              key={num}
              onClick={() => handleCircleClick(num)}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-medium shadow-md transition-transform hover:scale-105 hover:shadow-lg cursor-pointer ${
                (selectedNumber === num || lockedNumber === num) ? 'bg-red-500' : 'bg-green-500'
              }`}
            >
              {num}
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={handleLockClick}
            className="px-8 py-3 bg-neutral-800 text-white rounded-full font-medium shadow-lg hover:bg-neutral-900 transition"
          >
            Lock
          </button>
        </div>
      </div>
    </div>
  );
}

