import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Camera, X } from 'lucide-react';
import { UploadedImage } from '../types';

interface ImageUploaderProps {
  onImageSelected: (image: UploadedImage) => void;
  onClear: () => void;
  selectedImage: UploadedImage | null;
  isTranscribing: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, onClear, selectedImage, isTranscribing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Cleanup stream on unmount
    return () => {
      stopCamera();
    };
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      onImageSelected({
        previewUrl: URL.createObjectURL(file),
        base64: base64String,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const triggerSelect = () => fileInputRef.current?.click();

  // Camera Functions
  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      // Small timeout to ensure video element is mounted and ref is populated
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64 = dataUrl.split(',')[1];
        
        onImageSelected({
          previewUrl: dataUrl,
          base64: base64,
          mimeType: 'image/jpeg'
        });
        stopCamera();
      }
    }
  };

  if (selectedImage) {
    return (
      <div className="relative w-full h-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-700 shadow-inner">
        <img 
          src={selectedImage.previewUrl} 
          alt="Uploaded Note" 
          className="w-full h-full object-contain p-4"
        />
        {!isTranscribing && (
           <button 
             onClick={onClear}
             className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur text-slate-700 dark:text-slate-300 p-2 rounded-full shadow-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all border border-slate-200 dark:border-slate-700"
             title="Remove Image"
           >
             <X size={20} />
           </button>
        )}
      </div>
    );
  }

  if (isCameraOpen) {
    return (
      <div className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center">
         <video 
           ref={videoRef} 
           autoPlay 
           playsInline 
           muted 
           className="w-full h-full object-cover"
         />
         
         {/* Camera Controls Overlay */}
         <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-8 z-20">
            <button 
              onClick={stopCamera}
              className="p-3 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30 transition-all"
              title="Cancel"
            >
              <X size={24} />
            </button>
            
            <button 
              onClick={capturePhoto}
              className="p-1 rounded-full border-4 border-white/50 hover:border-white transition-all scale-100 active:scale-95"
              title="Capture Photo"
            >
              <div className="w-16 h-16 bg-white rounded-full"></div>
            </button>
             {/* Spacer to balance the Cancel button */}
             <div className="w-[48px]"></div> 
         </div>
       </div>
    );
  }

  return (
    <div 
      className={`
        w-full h-full min-h-[300px] flex flex-col items-center justify-center 
        border-2 border-dashed rounded-xl transition-all cursor-pointer relative
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/30 scale-[0.99]' 
          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerSelect}
    >
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
      
      <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full mb-4 text-indigo-600 dark:text-indigo-400">
        <UploadCloud size={32} />
      </div>
      <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">
        Click to upload or drag & drop
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Supports JPG, PNG, HEIC
      </p>

      <div className="flex gap-2 relative z-10">
         <button 
           type="button"
           className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm flex items-center gap-2"
           onClick={(e) => {
             e.stopPropagation();
             startCamera();
           }}
         >
           <Camera size={16} /> Use Camera
         </button>
      </div>
    </div>
  );
};