'use client';

import { useState } from 'react';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
};

const DEFAULT_QUESTIONS = [
  {
    id: 'q1',
    text: 'How do I book a home visit?',
    answer: "You can book a home visit by logging into your Patient Portal and selecting 'Book Appointment'. Choose your preferred doctor and time slot!"
  },
  {
    id: 'q2',
    text: 'How do I track my order?',
    answer: "Go to 'My Orders' in your account menu (after logging in) to see the status of all your equipment purchases."
  },
  {
    id: 'q3',
    text: 'How do I register as a Doctor?',
    answer: "Click 'Register' at the top of the page, select 'Doctor' as your role, and upload your credentials. Our admin will review and approve your account."
  }
];

export function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', sender: 'bot', text: 'Hi there! 👋 How can we help you today? Please choose a question below or contact our admin.' }
  ]);

  const handleQuestionClick = (questionId: string) => {
    const question = DEFAULT_QUESTIONS.find(q => q.id === questionId);
    if (!question) return;

    setMessages(prev => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text: question.text },
      { id: `b-${Date.now()}`, sender: 'bot', text: question.answer }
    ]);
  };

  const handleContactAdmin = () => {
    const phoneNumber = '+917305988515';
    const text = encodeURIComponent('Hi Admin, I need some help regarding the Physio app.');
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[350px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-primary p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                P
              </div>
              <div>
                <h3 className="font-bold text-sm">Physio Support</h3>
                <p className="text-xs text-primary-foreground/80">Typically replies instantly</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="p-4 flex-1 h-[350px] overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 shadow-sm rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Options / Footer */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-500 mb-2">Common Questions:</p>
            <div className="flex flex-col gap-2 mb-4">
              {DEFAULT_QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleQuestionClick(q.id)}
                  className="text-left text-sm p-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-colors transition-transform active:scale-[0.98]"
                >
                  {q.text}
                </button>
              ))}
            </div>

            <button
              onClick={handleContactAdmin}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm shadow-md shadow-green-500/25 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.711.927 3.149.929 3.181 0 5.767-2.587 5.768-5.766.001-3.181-2.586-5.769-5.768-5.771zm3.392 8.244c-.161.453-.89 .87-1.25.92-.358.05-.668.04-1.895-.443-1.464-.576-2.404-2.073-2.476-2.17-.072-.097-.591-.787-.591-1.503 0-.715.372-1.066.502-1.206.129-.14.28-.175.372-.175.093 0 .187 0 .267.004.084.004.194-.031.303.23.118.283.402.983.438 1.054.036.071.06.154.015.248-.046.094-.072.152-.143.235-.071.083-.149.18-.214.248-.073.076-.149.155-.065.301.083.145.373.619.8 1.002.548.492 1.014.646 1.157.718.143.072.228.059.314-.04.086-.098.369-.434.469-.582.1-.148.197-.123.332-.072.135.051.853.402.998.474.145.072.242.108.277.168.035.061.035.352-.126.805z" /></svg>
              Chat with Admin on WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all"
        aria-label="Toggle chat support"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>
    </>
  );
}
