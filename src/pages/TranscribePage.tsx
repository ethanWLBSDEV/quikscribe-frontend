import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';
import { useTranscriptionStore } from '../store/transcriptionStore';
import { TranscriptionService } from '../services/transcriptionService';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BuyProButton from '../components/BuyPro'

export default function TranscribePage() {
  const {
    file,
    status,
    progress,
    transcription,
    error,
    setFile,
    setStatus,
    setProgress,
    setTranscription,
    setError,
  } = useTranscriptionStore();

  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in by checking for token/username in localStorage
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/signin');  // Redirect to login page if no token found
    }
  }, [navigate]);

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFile(file);
    setUploadedFileName(file.name);
    setStatus('idle');
    setError(null);

  }, []);

  const handleTranscribeNow = async () => {
    if (file) {
      setStatus('processing');
      const transcriptionService = TranscriptionService.getInstance();
      try {
        const audioData = await transcriptionService.convertToWav(file);
        const text = await transcriptionService.transcribe(audioData, setProgress);
        setTranscription(text);
        setStatus('completed');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to transcribe file');
        setStatus('error');
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, // Ensure this function is correctly defined
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a'],
      'video/*': ['.mp4', '.mov'],
    },
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
    multiple: false,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Transcribe Your Media</h1>
          <p className="mt-2 text-gray-600">
            Upload your audio or video file to get started
          </p>
        </div>
        {uploadedFileName && ( // Render the uploaded file name
          <p className="mt-8 text-gray-800 font-semibold text-center">
            {uploadedFileName}
          </p>
        )}


        <div className="mt-12">
          {!uploadedFileName && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-500'}`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600">
                Drag and drop your file here, or click to select
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Supports MP3, WAV, MP4, and more (up to 2GB)
              </p>
            </div>
          )}
          {status === 'idle' && (
            <div className="text-center mt-20 flex justify-center">
              <button
                onClick={handleTranscribeNow}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Transcribe Now
              </button>
            </div>
          )}

          {status === 'processing' && (
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 text-purple-600 animate-spin" />
              <p className="mt-4 text-lg font-semibold">Processing your file...</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className='flex justify-end space-x-4 mb-4'>
              <BuyProButton />
            </div>
          )
          }
          {status === 'completed' && transcription && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Transcription Result</h2>
              <pre className="whitespace-pre-wrap text-gray-700 font-mono bg-gray-50 p-4 rounded">
                {transcription}
              </pre>
              <div className="mt-4 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setStatus('idle');
                    setFile(null);
                    setTranscription(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  New Transcription
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([transcription], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'transcription.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Download
                </button>
              </div>
            </div>
          )}

          {status === 'error' && error && (
            <div className="text-center text-red-600">
              <AlertCircle className="mx-auto h-12 w-12" />
              <p className="mt-2">{error}</p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}