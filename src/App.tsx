/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Sparkles, Trophy, Check, X, Info, RotateCcw } from 'lucide-react';
import { questions as defaultQuestions } from './questions';
import { CaseData } from './types';
import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Settings } from './components/Settings';
import { SpinWheel } from './components/SpinWheel';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [lockedNumbers, setLockedNumbers] = useState<number[]>([]);
  const [customQuestions, setCustomQuestions] = useState<{ [key: number]: CaseData }>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [spinWheelOpen, setSpinWheelOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [viewingQuestionId, setViewingQuestionId] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userSelections, setUserSelections] = useState<{ [qIndex: number]: number }>({});
  const [rapidRound, setRapidRound] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [participants, setParticipants] = useState<{ id: string, name: string, score: number }[]>([
    { id: '1', name: 'Participant 1', score: 0 },
    { id: '2', name: 'Participant 2', score: 0 },
    { id: '3', name: 'Participant 3', score: 0 }
  ]);
  const [activeParticipantIndex, setActiveParticipantIndex] = useState(0);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [scoredSubQuestions, setScoredSubQuestions] = useState<Record<number, Record<number, boolean>>>({});
  const [incorrectAttempts, setIncorrectAttempts] = useState<Record<number, Record<number, string[]>>>({});
  const [rapidStartDuration, setRapidStartDuration] = useState(60);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (rapidRound && timeLeft > 0 && viewingQuestionId !== null) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
        // Play tick sound
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      }, 1000);
    } else if (rapidRound && timeLeft === 0 && viewingQuestionId !== null) {
      // Time up: buzzer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
      oscillator.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 2);

      const nextDuration = rapidStartDuration - 10;
      const nextPIdx = (activeParticipantIndex + 1) % participants.length;
      const nextPName = participants[nextPIdx]?.name || `Participant ${nextPIdx + 1}`;

      if (nextDuration <= 0) {
        alert("समय सकियो! द्रुत राउन्ड समाप्त भयो।");
        setRapidRound(false);
      } else {
        alert(`समय सकियो! अर्को सहभागी (${nextPName}) को लागि ${nextDuration} सेकेन्ड सुरु हुँदैछ।`);
        setRapidStartDuration(nextDuration);
        setTimeLeft(nextDuration);
        setActiveParticipantIndex(nextPIdx);
        updateActiveParticipantIndex(nextPIdx);
      }
    }
    return () => clearTimeout(timer);
  }, [rapidRound, timeLeft, viewingQuestionId, rapidStartDuration, activeParticipantIndex, participants]);

  useEffect(() => {
    setUserSelections({});
    setShowAnswer(false);
    setScoredSubQuestions({});
    setIncorrectAttempts({});
    if (!rapidRound) {
      setTimeLeft(60);
      setRapidStartDuration(60);
    }
  }, [viewingQuestionId, rapidRound]);

  const handleIncorrect = async (qIndex: number) => {
    const currentParticipantId = participants[activeParticipantIndex]?.id;
    if (!currentParticipantId) return;

    // Check if they've already got it incorrect to prevent double clicks
    const subAttempts = incorrectAttempts[viewingQuestionId!]?.[qIndex] || [];
    if (subAttempts.includes(currentParticipantId)) {
      return;
    }

    const updatedAttempts = [...subAttempts, currentParticipantId];
    const updatedIncorrect = {
      ...incorrectAttempts,
      [viewingQuestionId!]: {
        ...(incorrectAttempts[viewingQuestionId!] || {}),
        [qIndex]: updatedAttempts
      }
    };

    // Deduct raw score
    const updatedParticipants = participants.map((p, idx) => idx === activeParticipantIndex ? ({ ...p, score: Math.round((p.score - 0.2) * 10) / 10 }) : p);
    
    const isCycleComplete = updatedAttempts.length >= participants.length;

    let nextDuration = rapidStartDuration;
    let nextPIdx = activeParticipantIndex;
    let shouldBeRapid = rapidRound;

    if (rapidRound) {
      const tempNextDuration = rapidStartDuration - 10;
      const tempNextPIdx = (activeParticipantIndex + 1) % participants.length;
      const nextPName = participants[tempNextPIdx]?.name || `Participant ${tempNextPIdx + 1}`;

      if (tempNextDuration <= 0 || isCycleComplete) {
        alert("गलत उत्तर! द्रुत राउन्ड समाप्त भयो वा सबै सहभागीहरूले यस प्रश्नको प्रयास गरिसक्नुभयो।");
        shouldBeRapid = false;
        nextDuration = 0;
      } else {
        alert(`गलत उत्तर! अर्को सहभागी (${nextPName}) को लागि ${tempNextDuration} सेकेन्ड सुरु।`);
        nextDuration = tempNextDuration;
        nextPIdx = tempNextPIdx;
      }
    } else {
      if (!isCycleComplete) {
        nextPIdx = (activeParticipantIndex + 1) % participants.length;
      } else {
        alert("सबै सहभागीहरूले प्रयास गरिसक्नुभयो। १ चक्र पुरा भयो, थप पास हुने छैन।");
      }
    }

    const docRef = doc(db, 'appState', 'global');
    try {
      await setDoc(docRef, {
        participants: updatedParticipants,
        incorrectAttempts: updatedIncorrect,
        activeParticipantIndex: nextPIdx,
        rapidRound: shouldBeRapid
      }, { merge: true });

      if (rapidRound) {
        setRapidStartDuration(nextDuration);
        setTimeLeft(nextDuration);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'appState/global');
    }
  };

  const questions = { ...defaultQuestions, ...customQuestions };

  useEffect(() => {
    const docRef = doc(db, 'appState', 'global');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLockedNumbers(data.lockedNumbers || []);
        setCustomQuestions(data.customQuestions || {});
        if (data.participants) {
          setParticipants(data.participants);
        } else {
          setDoc(docRef, {
            participants: [
              { id: '1', name: 'Participant 1', score: 0 },
              { id: '2', name: 'Participant 2', score: 0 },
              { id: '3', name: 'Participant 3', score: 0 }
            ],
            activeParticipantIndex: 0
          }, { merge: true }).catch((error) => {
            handleFirestoreError(error, OperationType.WRITE, 'appState/global');
          });
        }
        if (typeof data.activeParticipantIndex === 'number') {
          setActiveParticipantIndex(data.activeParticipantIndex);
        }

        // Sync additional quiz states across all connected clients in real-time
        setViewingQuestionId(data.viewingQuestionId !== undefined ? data.viewingQuestionId : null);
        setScoredSubQuestions(data.scoredSubQuestions || {});
        setIncorrectAttempts(data.incorrectAttempts || {});
        setUserSelections(data.userSelections || {});
        setShowAnswer(!!data.showAnswer);
        setRapidRound(!!data.rapidRound);
      } else {
        setLockedNumbers([]);
        setCustomQuestions({});
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'appState/global');
    });
  }, []);

  const updateLockedNumbers = async (newLockedNumbers: number[]) => {
    const docRef = doc(db, 'appState', 'global');
    try {
      await setDoc(docRef, { lockedNumbers: newLockedNumbers }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'appState/global');
    }
  };

  const updateCustomQuestions = async (newQuestions: { [key: number]: CaseData }) => {
    console.log('updateCustomQuestions', newQuestions);
    const docRef = doc(db, 'appState', 'global');
    try {
      await setDoc(docRef, { customQuestions: newQuestions }, { merge: true });
      console.log('Successfully updated customQuestions');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'appState/global');
    }
  };

  const updateParticipants = async (newParticipants: { id: string, name: string, score: number }[]) => {
    const docRef = doc(db, 'appState', 'global');
    try {
      await setDoc(docRef, { participants: newParticipants }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'appState/global');
    }
  };

  const updateActiveParticipantIndex = async (idx: number) => {
    const docRef = doc(db, 'appState', 'global');
    try {
      await setDoc(docRef, { activeParticipantIndex: idx }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'appState/global');
    }
  };

  const handleReset = async () => {
    if (confirm("के तपाइँ खेल रिसेट गर्न चाहनुहुन्छ? यसले सबै स्कोर, चरणहरू र छानिएका नम्बरहरू मेट्नेछ। (Are you sure you want to reset study progress?)")) {
      try {
        const docRef = doc(db, 'appState', 'global');
        const resetParts = participants.map(p => ({ ...p, score: 0 }));

        // Single atomic database write to avoid race conditions and intermediate state snapshots!
        await setDoc(docRef, {
          lockedNumbers: [],
          participants: resetParts,
          activeParticipantIndex: 0,
          viewingQuestionId: null,
          scoredSubQuestions: {},
          incorrectAttempts: {},
          userSelections: {},
          showAnswer: false,
          rapidRound: false
        }, { merge: true });

        // Update local React states in sync
        setLockedNumbers([]);
        setParticipants(resetParts);
        setActiveParticipantIndex(0);
        
        setSelectedNumber(null);
        setViewingQuestionId(null);
        setShowAnswer(false);
        setUserSelections({});
        setScoredSubQuestions({});
        setIncorrectAttempts({});
        setRapidRound(false);
        setTimeLeft(60);
        setRapidStartDuration(60);
        setSpinWheelOpen(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'appState/global');
      }
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
              onClick={async () => {
                const docRef = doc(db, 'appState', 'global');
                await setDoc(docRef, {
                  viewingQuestionId: null,
                  showAnswer: false,
                  userSelections: {},
                  scoredSubQuestions: {},
                  incorrectAttempts: {}
                }, { merge: true });
                setSelectedNumber(null);
              }}
              className="px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 transition text-sm"
            >
              ←
            </button>
            
            <button
              onClick={async () => {
                const docRef = doc(db, 'appState', 'global');
                await setDoc(docRef, { showAnswer: !showAnswer }, { merge: true });
              }}
              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-sm"
            >
               {showAnswer ? 'Hide Answers' : 'Show Answers'}
            </button>

            <button
              onClick={handleReset}
              className="ml-auto px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition text-sm font-semibold flex items-center gap-1.5"
            >
              <RotateCcw size={14} className="text-red-600" /> रिसेट (Reset)
            </button>
          </div>

          <h2 className="text-xl font-medium mb-3 text-neutral-800 flex justify-between items-center">
            Nº {viewingQuestionId} (Participant {participants[activeParticipantIndex]?.name})
            <div className="flex gap-2">
            </div>
            {rapidRound && (
                <span className={`font-mono text-2xl ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-neutral-600'}`}>
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
            )}
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
                              onClick={async () => {
                                if (!showAnswer) {
                                  const updatedSelections = { ...userSelections, [qIndex]: oIndex };
                                  const docRef = doc(db, 'appState', 'global');
                                  await setDoc(docRef, { userSelections: updatedSelections }, { merge: true });
                                }
                              }}
                              disabled={showAnswer}
                              className={`p-3 border rounded-lg text-left transition text-sm flex items-center justify-between ${
                                userSelections[qIndex] === oIndex
                                  ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400'
                                  : 'bg-white hover:bg-neutral-50'
                              } ${
                                showAnswer && oIndex === q.correctAnswerIndex
                                  ? 'bg-green-50 border-green-500' // Revealed Correct
                                  : ''
                              } ${
                                showAnswer && userSelections[qIndex] === oIndex && oIndex !== q.correctAnswerIndex
                                  ? 'bg-red-50 border-red-500' // Revealed Incorrect
                                  : ''
                              }`}
                            >
                              <span>{option}</span>
                              {showAnswer && oIndex === q.correctAnswerIndex && (
                                <Check size={18} className="text-green-600" />
                              )}
                              {showAnswer && userSelections[qIndex] === oIndex && oIndex !== q.correctAnswerIndex && (
                                <X size={18} className="text-red-600" />
                              )}
                            </button>
                          ))}
                        </div>
                        {showAnswer && (
                            <div className="mt-4 flex flex-col gap-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                                <p className="text-xs font-semibold text-neutral-600 mb-2">Record Score for Participant {participants[activeParticipantIndex]?.name || `P${activeParticipantIndex + 1}`}:</p>
                                <div className="flex gap-2">
                                    <button 
                                      onClick={async () => {
                                          const updated = participants.map((p, idx) => idx === activeParticipantIndex ? ({ ...p, score: Math.round((p.score + 5) * 10) / 10 }) : p);
                                          const updatedScored = {
                                            ...scoredSubQuestions,
                                            [viewingQuestionId!]: {
                                              ...(scoredSubQuestions[viewingQuestionId!] || {}),
                                              [qIndex]: true
                                            }
                                          };
                                          const docRef = doc(db, 'appState', 'global');
                                          await setDoc(docRef, {
                                            participants: updated,
                                            scoredSubQuestions: updatedScored
                                          }, { merge: true });
                                      }}
                                      disabled={scoredSubQuestions[viewingQuestionId!]?.[qIndex] || (incorrectAttempts[viewingQuestionId!]?.[qIndex]?.length >= participants.length)}
                                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                      <Check size={16} /> Correct (+5)
                                    </button>
                                    <button 
                                      onClick={() => handleIncorrect(qIndex)}
                                      disabled={scoredSubQuestions[viewingQuestionId!]?.[qIndex] || (incorrectAttempts[viewingQuestionId!]?.[qIndex]?.length >= participants.length)}
                                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-700 transition disabled:opacity-50"
                                    >
                                      <X size={16} /> Incorrect (-0.2)
                                    </button>
                                </div>
                            </div>
                        )}
                      </div>
                    ))
                    : (questions[viewingQuestionId].questions as string[]).map((q, qIndex) => (
                      <div key={qIndex} className="p-3 border rounded-lg">
                        <p className="font-medium text-sm mb-2">{qIndex + 1}. {q}</p>
                        {showAnswer && (
                          <div className="mt-4 space-y-4">
                              <div className="bg-green-100 border border-green-500 p-2 rounded text-xs">
                                  Answer: {(questions[viewingQuestionId] as any).answers[qIndex]}
                              </div>
                              <div className="flex flex-col gap-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                                  <p className="text-xs font-semibold text-neutral-600 mb-2">Record Score for Participant {participants[activeParticipantIndex]?.name || `P${activeParticipantIndex + 1}`}:</p>
                                  <div className="flex gap-2">
                                      <button 
                                          onClick={async () => {
                                              const updated = participants.map((p, idx) => idx === activeParticipantIndex ? ({ ...p, score: Math.round((p.score + 5) * 10) / 10 }) : p);
                                              const updatedScored = {
                                                ...scoredSubQuestions,
                                                [viewingQuestionId!]: {
                                                  ...(scoredSubQuestions[viewingQuestionId!] || {}),
                                                  [qIndex]: true
                                                }
                                              };
                                              const docRef = doc(db, 'appState', 'global');
                                              await setDoc(docRef, {
                                                participants: updated,
                                                scoredSubQuestions: updatedScored
                                              }, { merge: true });
                                          }}
                                          disabled={scoredSubQuestions[viewingQuestionId!]?.[qIndex] || (incorrectAttempts[viewingQuestionId!]?.[qIndex]?.length >= participants.length)}
                                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:opacity-50"
                                      >
                                          <Check size={16} /> Correct (+5)
                                      </button>
                                      <button 
                                          onClick={() => handleIncorrect(qIndex)}
                                          disabled={scoredSubQuestions[viewingQuestionId!]?.[qIndex] || (incorrectAttempts[viewingQuestionId!]?.[qIndex]?.length >= participants.length)}
                                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-700 transition disabled:opacity-50"
                                      >
                                          <X size={16} /> Incorrect (-0.2)
                                      </button>
                                  </div>
                              </div>
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
      const currentSelectionCount = lockedNumbers.length;
      if (currentSelectionCount < 10) {
        setSelectedNumber(num);
      } else if (currentSelectionCount < 20) {
        alert("दोस्रो चरण सुरु भइसकेको छ! कृपया स्पिन ह्विल (Spin Button) प्रयोग गरी बाँकी प्रश्नहरू छान्नुहोस्। (Phase 1 Grid Selection complete. Please use the Spin Wheel button).");
      } else {
        alert("तेस्रो चरण (द्रुत राउन्ड) सुरु भइसकेको छ! बाँकी प्रश्नहरू स्पिन ह्विल प्रयोग गरी द्रुत समय सीमा भित्र मात्र खोल्न मिल्नेछ।");
      }
    }
  };

  const handleLockClick = async () => {
    if (selectedNumber !== null) {
      const nextIdx = (activeParticipantIndex + 1) % participants.length;
      const docRef = doc(db, 'appState', 'global');
      try {
        await setDoc(docRef, {
          lockedNumbers: [...lockedNumbers, selectedNumber],
          viewingQuestionId: selectedNumber,
          activeParticipantIndex: nextIdx,
          showAnswer: false,
          userSelections: {},
          scoredSubQuestions: {},
          incorrectAttempts: {}
        }, { merge: true });
        setSelectedNumber(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'appState/global');
      }
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
        onNumberSelected={async (num, isRapid) => {
          const nextIdx = (activeParticipantIndex + 1) % participants.length;
          const shouldBeRapid = !!isRapid || lockedNumbers.length >= 20;
          const docRef = doc(db, 'appState', 'global');
          try {
            await setDoc(docRef, {
              lockedNumbers: [...lockedNumbers, num],
              viewingQuestionId: num,
              activeParticipantIndex: nextIdx,
              rapidRound: shouldBeRapid,
              showAnswer: false,
              userSelections: {},
              scoredSubQuestions: {},
              incorrectAttempts: {}
            }, { merge: true });
            setTimeLeft(60);
            setRapidStartDuration(60);
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'appState/global');
          }
        }}
      />
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Horizontal Navigation & Control Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const currentSelectionCount = lockedNumbers.length;
                if (currentSelectionCount < 10) {
                  alert("पहिलो चरणमा ग्रिडबाट १० वटा प्रश्न सिधै छनोट गर्नुपर्नेछ। (Please select up to 10 questions directly from the number grid first).");
                } else {
                  setSpinWheelOpen(true);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                lockedNumbers.length >= 10 
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' 
                  : 'bg-neutral-50 text-neutral-400 border border-neutral-100 cursor-not-allowed'
              }`}
            >
              <Sparkles size={14} className={lockedNumbers.length >= 10 ? "animate-pulse text-blue-500" : ""} />
              Spin Wheel
            </button>
            <button
              onClick={() => setShowScoreboard(true)}
              className="px-3 py-1.5 bg-white border border-neutral-200 shadow-xs hover:bg-neutral-50 text-neutral-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Trophy size={14} className="text-yellow-600" /> Scoreboard
            </button>
            <button
              onClick={() => setShowRules(true)}
              className="px-3 py-1.5 bg-white border border-neutral-200 shadow-xs hover:bg-neutral-50 text-neutral-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Info size={14} className="text-blue-500" /> नियमहरू (Rules)
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-red-50 border border-red-200 shadow-xs hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
            >
              <RotateCcw size={14} className="text-red-600" /> रिसेट (Reset)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 rounded-lg border border-neutral-200/60 bg-white transition"
              title="Settings"
            >
              <SettingsIcon size={15} />
            </button>
          </div>
        </div>

        {/* Active Stage Indicator Card: Ultra-compact, single-line horizontal card */}
        <div className="p-1.5 px-4 bg-white rounded-xl shadow-xs border border-neutral-200 max-w-2xl mx-auto transition-all">
          {lockedNumbers.length < 10 ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-extrabold text-green-700 tracking-wide uppercase">चरण १: ग्रिड छनौट</span>
              </div>
              <div className="text-[11px] text-neutral-500 font-medium font-sans">
                सिधै ग्रिडबाट आफ्नो इच्छा अनुसार नम्बर रोजेर प्रश्न खेल्नुहोस्।
              </div>
              <div className="text-[10px] text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full font-mono font-bold">
                प्रश्न: {lockedNumbers.length}/१०
              </div>
            </div>
          ) : lockedNumbers.length < 20 ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-xs font-extrabold text-blue-700 tracking-wide uppercase">चरण २: स्पिन भाग्यशाली छनौट</span>
              </div>
              <div className="text-[11px] text-neutral-500 font-medium font-sans">
                स्पिन बटन थिची भाग्यशाली नम्बर मार्फत प्रश्न खेल्नुहोस्।
              </div>
              <div className="text-[10px] text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full font-mono font-bold">
                प्रश्न: {lockedNumbers.length}/१०+
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                <span className="text-xs font-extrabold text-purple-700 tracking-wide uppercase">चरण ३: र्‍यापिड मोड</span>
              </div>
              <div className="text-[11px] text-neutral-500 font-medium font-sans">
                द्रुत राउन्डको समय सीमा भित्र प्रश्नको उत्तर दिनुहोस्।
              </div>
              <div className="text-[10px] text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full font-mono font-bold">
                प्रश्न: {lockedNumbers.length - 20}/१०+
              </div>
            </div>
          )}
        </div>

        {/* Title and Numbers Grid */}
        <h1 className="text-3xl font-light text-neutral-700 mb-10 text-center tracking-tight pt-4">
          कुनै एउटा नम्बर छान्नुहोस्
        </h1>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-6 justify-items-center">
          {numbers.map((num) => (
            <div
              key={num}
              id={`number-circle-${num}`}
              onClick={() => handleCircleClick(num)}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-medium shadow-md transition-transform hover:scale-105 hover:shadow-lg cursor-pointer ${
                (selectedNumber === num || lockedNumbers.includes(num)) ? 'bg-red-500' : 'bg-green-500'
              }`}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Action buttons (Lock and reset) */}
        <div className="mt-12 flex justify-center gap-4 pb-8">
          {selectedNumber !== null && !lockedNumbers.includes(selectedNumber) && (
            <button
              id="lock-btn"
              onClick={handleLockClick}
              className="px-8 py-3 bg-neutral-800 text-white rounded-full font-medium shadow-lg hover:bg-neutral-900 transition cursor-pointer"
            >
              Lock
            </button>
          )}
          {lockedNumbers.length > 0 && (
            <button
              id="reset-btn"
              onClick={handleReset}
              className="px-8 py-3 bg-red-600 text-white rounded-full font-medium shadow-lg hover:bg-red-700 transition cursor-pointer"
            >
              Reset progress / Scores
            </button>
          )}
        </div>

        {/* Scoreboard Modal Overlays */}
        {showScoreboard && (
          <div className="fixed inset-0 bg-neutral-900/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Scoreboard & Participants</h2>
                <button onClick={() => setShowRules(true)} className="text-neutral-500 hover:text-neutral-700">
                  <Info size={24} />
                </button>
              </div>
              <div className="space-y-4">
                {[...participants]
                  .sort((a, b) => b.score - a.score)
                  .map((p) => (
                    <div key={p.id} className="flex justify-between items-center p-3 border rounded">
                       <input 
                          value={p.name}
                          onChange={(e) => {
                            const updated = participants.map((part) => part.id === p.id ? {...part, name: e.target.value} : part);
                            setParticipants(updated);
                          }}
                          onBlur={() => updateParticipants(participants)}
                          className="w-2/3 border-none p-0 focus:ring-0"
                       />
                       <div className="flex gap-2 items-center">
                          <span className="font-bold">{p.score}</span>
                          <button onClick={() => {
                            const updated = participants.filter((part) => part.id !== p.id);
                            setParticipants(updated);
                            updateParticipants(updated);
                          }} className="text-red-500 hover:text-red-700">×</button>
                       </div>
                    </div>
                  ))}
                <button onClick={() => {
                  const updated = [...participants, { id: Date.now().toString(), name: 'New Participant', score: 0 }];
                  setParticipants(updated);
                  updateParticipants(updated);
                }} className="w-full bg-neutral-100 p-2 rounded hover:bg-neutral-200">+ Add Participant</button>
              </div>
              <button onClick={() => setShowScoreboard(false)} className="mt-4 w-full bg-blue-500 text-white p-2 rounded">Close</button>
            </div>
          </div>
        )}

        {/* Rules Modal Overlay */}
        {showRules && (
          <div className="fixed inset-0 bg-white z-[100] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Rules Header */}
            <div className="p-5 border-b border-neutral-100 bg-neutral-50 shadow-xs">
              <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                    <Info size={24} className="text-blue-600" />
                    खेलका नियम र चरणहरू (Detailed Game Rules)
                  </h2>
                  <p className="text-sm text-neutral-500 mt-0.5">नियमहरू ध्यानपूर्वक पढेर र पालना गरेर खेल खेल्नुहोला।</p>
                </div>
                <button 
                  onClick={() => setShowRules(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 text-2xl transition"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Rules Body Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-neutral-50/30">
              <div className="max-w-4xl mx-auto w-full space-y-6 text-sm text-neutral-700 leading-relaxed">
                {/* 1. Scoring */}
                <div className="bg-white rounded-xl border border-neutral-100 p-6 shadow-sm">
                  <h3 className="font-bold text-neutral-950 border-b pb-1.5 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-blue-700">
                    🏆 १. अंक प्रणाली (Scoring Rules)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="bg-green-50/70 p-4 rounded-lg border border-green-100 text-center">
                      <div className="text-sm text-green-800 font-bold mb-0.5">सहि उत्तर (+५)</div>
                      <p className="text-xs text-green-700/90 leading-tight">प्रत्येक सहि उप-उत्तर दिएमा सहभागीले ५ अंक प्राप्त गर्नेछन्।</p>
                    </div>
                    <div className="bg-red-50/70 p-4 rounded-lg border border-red-100 text-center">
                      <div className="text-sm text-red-800 font-bold mb-0.5">गलत उत्तर (-०.२)</div>
                      <p className="text-xs text-red-700/90 leading-tight">कुनै पनि गलत उत्तरको प्रयास गर्दा सहभागीको ०.२ अंक काटिनेछ।</p>
                    </div>
                  </div>
                  <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm text-neutral-600 mt-2">
                    <li><strong>पालो प्रणाली:</strong> सहभागीहरूले पालैपालो प्रश्नको उत्तर दिनेछन्। एउटा नम्बर लक गरेपछि वा स्पिन गरेपछि अर्को सहभागीको पालो आउनेछ।</li>
                    <li><strong>पास गर्ने नियम (Cycle Limit):</strong> कुनै पनि प्रश्न बढीमा १ चक्र (One Complete Cycle) सम्म मात्र पास हुन पाउनेछ। सबै सहभागीले प्रयास गरिसकेपछि वा पास गरेपछि सो प्रश्न सदाका लागि बन्द हुनेछ।</li>
                  </ul>
                </div>

                {/* 2. Stages Details */}
                <div className="bg-white rounded-xl border border-neutral-100 p-6 shadow-sm">
                  <h3 className="font-bold text-neutral-950 border-b pb-1.5 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-blue-700">
                    🔄 २. खेलका मुख्य ३ चरणहरू (Three Game Stages)
                  </h3>
                  <div className="space-y-4">
                    {/* Stage 1 */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                        <h4 className="text-sm font-bold text-neutral-800">चरण १: नम्बर ग्रिड छनौट (प्रश्न १ देखि १०)</h4>
                      </div>
                      <p className="text-xs md:text-sm text-neutral-600 pl-4 leading-normal">
                        यस चरणमा सहभागिहरूले स्क्रिनमा रहेको नम्बर ग्रिडबाट सिधै आफूले चाहेको नम्बर रोजेर प्रश्नहरू खेल्न पाउनेछन्। कुल १० वटा प्रश्नहरू खेलिएपछि पहिलो चरण स्वतः समाप्त भई दोस्रो चरण सक्रिय हुनेछ।
                      </p>
                    </div>

                    {/* Stage 2 */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                        <h4 className="text-sm font-bold text-neutral-800">चरण २: स्पिन भाग्यशाली छनौट (प्रश्न ११ देखि २०)</h4>
                      </div>
                      <p className="text-xs md:text-sm text-neutral-600 pl-4 leading-normal">
                        दोस्रो चरण सुरु भएपछि ग्रिड स्वतः लक हुनेछ। सहभागिहरूले सिधै नम्बर छनोट गर्न पाउने छैनन्। उनीहरूले <strong>'Spin Wheel'</strong> बटन थिचेर भाग्यशाली रूपमा अर्को १० वटा प्रश्नहरू छानी खेल्नुपर्नेछ।
                      </p>
                    </div>

                    {/* Stage 3 */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                        <h4 className="text-sm font-bold text-neutral-800">चरण ३: र्‍यापिड राउन्ड (Rapid Mode - बाँकी प्रश्नहरू)</h4>
                      </div>
                      <p className="text-xs md:text-sm text-neutral-600 pl-4 leading-normal">
                        कुल २० वटा प्रश्न समाप्त भएपछि तेस्रो चरण सुरु हुनेछ। बाँकी सबै प्रश्नहरू र्‍यापिड समय सीमा भित्र स्वतः खेलिनेछन्:
                        <span className="block mt-2 bg-white p-3 rounded-lg border border-neutral-200/60 font-mono text-xs leading-relaxed text-purple-800">
                          ⏱️ हरेक नयाँ उप-प्रश्नको समय ६० सेकेन्ड रहनेछ। <br/>
                          ⏱️ समय सकिएमा वा गलत उत्तर दिएमा, पालो सर्दा सुरुवाती समयबाट १० सेकेन्ड कट्टा हुनेछ (५०, ४०, ३० सेकेन्ड हुँदै...) <br/>
                          ⏱️ समय सीमा ० सेकेन्ड वा त्यो भन्दा कम भएमा प्रश्नको पालो रद्द हुनेछ।
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules Footer */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
              <div className="max-w-4xl mx-auto w-full flex justify-end">
                <button 
                  onClick={() => setShowRules(false)}
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 transition shadow-sm"
                >
                  नियमहरू बुझें (Understood)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

