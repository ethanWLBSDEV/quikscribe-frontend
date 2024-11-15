import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TryForFreeModal from './TryForFreeModal';

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-white pt-32 pb-16" id='hero'>
      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full bg-purple-100 px-4 py-1.5 mb-8">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-purple-600"></span>
                <span className="text-sm font-medium text-purple-600">
                  AI-Powered Transcription for Everyone
                </span>
              </div>
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Voice to Text, {' '}
              <span className="text-purple-600">Simplified and</span>
              <br />
              <span className="text-purple-600">Redefined!</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Turn Conversations into Text – Fast, Accurate, Effortless! <br />
              Perfect for meetings and interviews.
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={() => navigate('/transcribe')}
                className="rounded-lg bg-purple-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Start Transcribing
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-lg border-2 border-purple-600 px-8 py-3 text-lg font-semibold text-purple-600 hover:bg-purple-50 transition-colors"
              >
                Try for FREE
              </button>
            </div>
          </div>
        </div>
      </div>

      <TryForFreeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}