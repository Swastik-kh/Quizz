import { useState } from 'react';
import { motion, useAnimation } from 'motion/react';
import { X } from 'lucide-react';

interface SpinWheelProps {
  isOpen: boolean;
  onClose: () => void;
  lockedNumbers: number[];
  onNumberSelected: (num: number, isRapid?: boolean) => void;
}

export function SpinWheel({ isOpen, onClose, lockedNumbers, onNumberSelected }: SpinWheelProps) {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const controls = useAnimation();

  const currentPhase = lockedNumbers.length < 10 ? 1 : lockedNumbers.length < 20 ? 2 : 3;

  const handleSpin = async (isRapid = false) => {
    if (isSpinning) return;
    
    const availableNumbers = Array.from({ length: 30 }, (_, i) => i + 1).filter(
      (n) => !lockedNumbers.includes(n)
    );

    if (availableNumbers.length === 0) {
      alert("सबै नम्बरहरू छानिसकियो!");
      return;
    }

    setIsSpinning(true);
    setSelectedNumber(null);

    const winner = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
    
    // Each number is 360/30 = 12 degrees.
    const rotation = -(winner - 1) * 12;

    // Animate spinning: extra spins + target rotation
    await controls.start({
      rotate: 360 * 5 + rotation,
      transition: { duration: 4, ease: "easeOut" }
    });

    setSelectedNumber(winner);
    setIsSpinning(false);
    
    // If it is Phase 3 or rapid flag is passed, automatically submit with rapid
    const shouldSubmitAsRapid = isRapid || currentPhase === 3;
    if (shouldSubmitAsRapid) {
        onNumberSelected(winner, true);
        onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Lucky Draw - चरण {currentPhase}</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            {/* Pointer */}
            <div className="absolute -top-4 left-1/2 -ml-[12px] w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-600 z-10" />
            
            <motion.div
              animate={controls}
              className="w-64 h-64 border-8 border-white rounded-full flex items-center justify-center relative shadow-2xl overflow-hidden"
              style={{
                background: 'conic-gradient(from 0deg, #f87171, #fb923c, #fbbf24, #a3e635, #34d399, #22d3ee, #818cf8, #c084fc, #f87171)'
              }}
            >
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i + 1}
                  className="absolute text-sm font-bold text-white w-full h-full flex justify-center pt-2"
                  style={{
                    transform: `rotate(${i * 12}deg)`,
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </motion.div>
            
            {/* Central display */}
            {!isSpinning && selectedNumber && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 rounded-full w-20 h-20 flex items-center justify-center text-4xl font-extrabold text-neutral-800 shadow-lg">
                  {selectedNumber}
                </div>
              </div>
            )}
          </div>

          {selectedNumber !== null && !isSpinning ? (
            <button
              onClick={() => {
                onNumberSelected(selectedNumber, currentPhase === 3);
                onClose();
              }}
              className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold transition hover:bg-blue-700"
            >
              प्रश्न खोल्नुहोस् {currentPhase === 3 ? '(द्रुत)' : ''}
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              {currentPhase === 3 ? (
                <button
                  onClick={() => handleSpin(true)}
                  disabled={isSpinning}
                  className={`w-full max-w-sm py-3 rounded-full text-white font-bold transition flex items-center justify-center gap-2 shadow-md ${
                    isSpinning ? 'bg-neutral-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 animate-pulse'
                  }`}
                >
                  {isSpinning ? 'पर्खनुहोस् (Spinning...)' : '⚡ स्पिन र र्‍यापिड राउन्ड (Spin & Rapid)'}
                </button>
              ) : (
                <div className="flex w-full justify-center">
                  <button
                    onClick={() => handleSpin(false)}
                    disabled={isSpinning}
                    className={`w-full max-w-sm py-3 rounded-full text-white font-semibold transition shadow-md ${
                      isSpinning ? 'bg-neutral-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isSpinning ? 'पर्खनुहोस् (Spinning...)' : '🎡 स्पिन गर्नुहोस् (Spin)'}
                  </button>
                </div>
              )}
              <span className="text-xs text-neutral-500 font-medium text-center">
                {currentPhase === 3 
                  ? "द्रुत चरण: बाँकी प्रश्नहरू समय सीमा भित्र खेलिनेछ।" 
                  : "स्पिन चरण: प्रश्नहरू स्पिन ह्विलबाट मात्र रोज्न मिल्नेछ।"}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
