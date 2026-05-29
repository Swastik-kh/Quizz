import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { questions as defaultQuestions, CaseData } from '../questions';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  customQuestions: { [key: number]: CaseData };
  onUpdateQuestions: (newQuestions: { [key: number]: CaseData }) => void;
}

export function Settings({ isOpen, onClose, customQuestions, onUpdateQuestions }: SettingsProps) {
  const [activeCase, setActiveCase] = useState<number>(1);
  const [draftQuestions, setDraftQuestions] = useState(customQuestions);

  useEffect(() => {
    setDraftQuestions(customQuestions);
  }, [customQuestions]);

  const currentQuestions = { ...defaultQuestions, ...draftQuestions };

  if (!isOpen) return null;

  const updateCase = (updatedData: Partial<CaseData>) => {
    setDraftQuestions({
      ...draftQuestions,
      [activeCase]: { ...currentQuestions[activeCase], ...updatedData }
    });
  };

  const handleUpdate = () => {
    onUpdateQuestions(draftQuestions);
    onClose();
  };

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
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-neutral-800 flex items-center gap-2">
            <SettingsIcon size={20} /> सेटिङ्स
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">केस छान्नुहोस्</label>
            <select
              value={activeCase}
              onChange={(e) => setActiveCase(Number(e.target.value))}
              className="w-full p-3 border rounded-lg"
            >
              {[...Array(30)].map((_, i) => (
                <option key={i + 1} value={i + 1}>केस {i + 1}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">विवरण</label>
              <textarea
                value={currentQuestions[activeCase].description}
                onChange={(e) => updateCase({ description: e.target.value })}
                className="w-full p-3 border rounded-lg"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">प्रश्नहरू (एउटा प्रति लाइन)</label>
              <textarea
                value={currentQuestions[activeCase].questions.join('\n')}
                onChange={(e) => updateCase({ questions: e.target.value.split('\n') })}
                className="w-full p-3 border rounded-lg"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">उत्तरहरू (एउटा प्रति लाइन)</label>
              <textarea
                value={currentQuestions[activeCase].answers.join('\n')}
                onChange={(e) => updateCase({ answers: e.target.value.split('\n') })}
                className="w-full p-3 border rounded-lg"
                rows={4}
              />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-neutral-100 flex justify-end">
            <button 
                onClick={handleUpdate}
                className="px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-900 transition"
            >
                अपडेट गर्नुहोस्
            </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
