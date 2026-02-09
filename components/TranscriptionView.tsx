import React, { useState } from 'react';
import { ArrowLeft, Loader2, ArrowRight } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { TranscriptionEditor } from './TranscriptionEditor';
import { transcribeImage } from '../services/geminiService';
import { TranscriptionState, UploadedImage } from '../types';

interface TranscriptionViewProps {
  onCancel: () => void;
  onSave: (content: string, image?: string) => void;
  apiKey?: string;
  model?: string;
}

export const TranscriptionView: React.FC<TranscriptionViewProps> = ({ onCancel, onSave, apiKey, model }) => {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionState>({
    status: 'idle',
    markdown: '',
  });

  const handleTranscribe = async () => {
    if (!image) return;

    setTranscription({ status: 'loading', markdown: '' });

    try {
      const markdown = await transcribeImage(image.base64, image.mimeType, { apiKey, model });
      setTranscription({ status: 'success', markdown });
    } catch (error: any) {
      setTranscription({ 
        status: 'error', 
        markdown: '', 
        error: error.message 
      });
    }
  };

  const handleClear = () => {
    setImage(null);
    setTranscription({ status: 'idle', markdown: '' });
  };

  const handleSave = () => {
    if (transcription.markdown) {
      onSave(transcription.markdown, image?.previewUrl);
    }
  };

  return (
    <div className="h-full flex flex-col">
       <div className="flex-none bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between transition-colors">
          <button onClick={onCancel} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-2 font-medium">
            <ArrowLeft size={18} /> Cancel
          </button>
          <span className="font-semibold text-slate-700 dark:text-slate-200">New Transcription</span>
          <div className="w-[70px]"></div> {/* Spacer */}
       </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 min-h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[800px] lg:h-[calc(100vh-10rem)]">
            
            {/* Left Column: Input */}
            <div className="flex flex-col gap-4 h-[500px] lg:h-full">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 transition-colors">
                <h2 className="font-semibold text-slate-800 dark:text-slate-100">Source Image</h2>
                {image && transcription.status === 'idle' && (
                   <button
                    onClick={handleTranscribe}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-200 dark:shadow-none flex items-center gap-2"
                  >
                    Transcribe <ArrowRight size={16} />
                  </button>
                )}
                {transcription.status === 'loading' && (
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg">
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </div>
                )}
                 {transcription.status === 'success' && (
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg">
                    Completed
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm relative transition-colors">
                <ImageUploader 
                  selectedImage={image} 
                  onImageSelected={setImage}
                  onClear={handleClear}
                  isTranscribing={transcription.status === 'loading'}
                />
              </div>

              {transcription.status === 'error' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl text-sm shrink-0">
                  <strong>Error:</strong> {transcription.error}
                </div>
              )}
            </div>

            {/* Right Column: Output */}
            <div className="flex flex-col gap-4 h-[500px] lg:h-full">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 shrink-0 transition-colors">
                <h2 className="font-semibold text-slate-800 dark:text-slate-100">Transcription Result</h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <TranscriptionEditor 
                  markdown={transcription.markdown}
                  setMarkdown={(val) => setTranscription(prev => ({ ...prev, markdown: val }))}
                  onSave={transcription.status === 'success' ? handleSave : undefined}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};