import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { X, Settings as SettingsIcon, ShieldAlert } from 'lucide-react';
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

  // Keep track of local password authorization
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return sessionStorage.getItem('is_settings_authorized') === 'true';
  });
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'swastikkhatiwada93@gmail.com' && password === 'swastik') {
      setIsAuthorized(true);
      sessionStorage.setItem('is_settings_authorized', 'true');
      setErrorMsg('');
    } else {
      setErrorMsg('गलत प्रयोगकर्ता नाम वा पासवर्ड!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl border border-neutral-100"
      >
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-neutral-800 flex items-center gap-2">
            <SettingsIcon size={20} /> सेटिङ्स
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {!isAuthorized ? (
          // Authorization form - username and password required first
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-6 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            <div className="text-center space-y-2 mb-2">
              <div className="inline-flex p-3 bg-amber-50 text-amber-600 rounded-full mx-auto">
                <ShieldAlert size={28} />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800">सुरक्षित सुिटङ (Secure Section)</h3>
              <p className="text-sm text-neutral-500">
                सेटिङ परिवर्तन गर्न कृपया लगइन गर्नुहोस्।
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm text-center font-medium">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4 font-sans">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  प्रयोगकर्ता नाम / इमेल (Username)
                </label>
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="swastikkhatiwada93@gmail.com"
                  required
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-700 font-sans"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  पासवर्ड (Password)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-700 font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-900 transition-colors font-semibold"
            >
              प्रवेश गर्नुहोस्
            </button>
          </form>
        ) : (
          // Actual settings configuration form once authorized
          <>
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">केस छान्नुहोस्</label>
                <select
                  value={activeCase}
                  onChange={(e) => setActiveCase(Number(e.target.value))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-neutral-700 focus:outline-none"
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
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-neutral-700 focus:outline-none"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">प्रश्नहरू (एउटा प्रति लाइन)</label>
                  <textarea
                    value={(currentQuestions[activeCase].questions || []).join('\n')}
                    onChange={(e) => updateCase({ questions: e.target.value.split('\n') })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-neutral-700 focus:outline-none"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">उत्तरहरू (एउटा प्रति लाइन)</label>
                  <textarea
                    value={(currentQuestions[activeCase].answers || []).join('\n')}
                    onChange={(e) => updateCase({ answers: e.target.value.split('\n') })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-neutral-700 focus:outline-none"
                    rows={4}
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-neutral-100 flex justify-end gap-2">
              <button 
                onClick={handleUpdate}
                className="px-6 py-2.5 bg-neutral-800 text-white rounded-lg hover:bg-neutral-900 transition font-medium"
              >
                अपडेट गर्नुहोस्
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
