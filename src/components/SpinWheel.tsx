import { useState } from 'react';
import { motion, useAnimation } from 'motion/react';
import { X } from 'lucide-react';

interface SpinWheelProps {
  isOpen: boolean;
  onClose: () => void;
  lockedNumbers: number[];
  onNumberSelected: (num: number) => void;
}

export function SpinWheel({ isOpen, onClose, lockedNumbers, onNumberSelected }: SpinWheelProps) {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const controls = useAnimation();

  const handleSpin = async () => {
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
    // The pointer is at the top (0 degrees).
    // To align number `winner` (at starting position `(winner-1) * 12`)
    // with the pointer at 0 degrees, we need to rotate by `-(winner-1) * 12`.
    const rotation = -(winner - 1) * 12;

    // Animate spinning: extra spins + target rotation
    await controls.start({
      rotate: 360 * 5 + rotation,
      transition: { duration: 4, ease: "easeOut" }
    });

    setSelectedNumber(winner);
    setIsSpinning(false);
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
          <h2 className="text-xl font-semibold">Lucky Draw</h2>
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
            
            {/* Central display (outside motion.div so it doesn't rotate) */}
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
                onNumberSelected(selectedNumber);
                onClose();
              }}
              className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold transition hover:bg-blue-700"
            >
              प्रश्न खोल्नुहोस्
            </button>
          ) : (
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`px-8 py-3 rounded-full text-white font-semibold transition ${
                isSpinning ? 'bg-neutral-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSpinning ? 'Spinning...' : 'Spin!'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
