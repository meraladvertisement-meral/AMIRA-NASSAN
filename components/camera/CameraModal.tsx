
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ThreeDButton } from '../layout/ThreeDButton';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  t: any;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture, t }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: { 
          facingMode: mode, 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        },
        audio: false
      };
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err: any) {
      console.warn(`Camera mode ${mode} failed:`, err);
      
      // Fallback: If environment fails, try user
      if (mode === 'environment') {
        setFacingMode('user');
        return; // The useEffect will re-run with 'user'
      }

      // If both fail, try any available camera with basic constraints
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
        setError(null);
      } catch (finalErr) {
        setError(t.appName === 'SnapQuizGame' ? "Camera not found or permission denied." : "Kamera nicht gefunden oder Zugriff verweigert.");
      }
    }
  }, [stream, t.appName]);

  useEffect(() => {
    if (isOpen && !previewImage) {
      startCamera(facingMode);
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, facingMode, previewImage]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPreviewImage(dataUrl);
      }
    }
  };

  const handleConfirm = () => {
    if (previewImage) {
      onCapture(previewImage);
      onClose();
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in fade-in duration-300">
      {/* Viewfinder or Preview */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black">
        {previewImage ? (
          <img src={previewImage} alt="Capture Preview" className="w-full h-full object-contain" />
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
            />
            {/* Viewfinder Overlay */}
            <div className="absolute inset-0 border-[20px] border-black/40 pointer-events-none">
              <div className="w-full h-full border-2 border-white/30 rounded-3xl relative">
                <div className="absolute top-1/2 left-0 w-full h-px bg-white/10"></div>
                <div className="absolute top-0 left-1/2 w-px h-full bg-white/10"></div>
              </div>
            </div>
          </>
        )}

        {/* Top Controls */}
        <div className="absolute top-8 left-0 right-0 px-8 flex justify-between items-center z-10">
          <button 
            onClick={onClose} 
            className="w-12 h-12 rounded-2xl bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"
          >
            ✕
          </button>
          {!previewImage && !error && (
            <button 
              onClick={toggleCamera} 
              className="w-12 h-12 rounded-2xl bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"
            >
              🔄
            </button>
          )}
        </div>

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/90 text-white text-center gap-4">
            <span className="text-5xl">📷</span>
            <p className="font-bold text-lg max-w-xs">{error}</p>
            <ThreeDButton variant="secondary" onClick={onClose} className="mt-4">
              {t.cancel || "Close"}
            </ThreeDButton>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="h-40 bg-black flex items-center justify-center px-8">
        {!previewImage && !error ? (
          <button 
            onClick={capture}
            className="w-20 h-20 rounded-full border-4 border-white/30 p-1.5 active:scale-90 transition-all"
          >
            <div className="w-full h-full bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)]"></div>
          </button>
        ) : previewImage ? (
          <div className="flex gap-4 w-full max-w-md">
            <ThreeDButton 
              variant="secondary" 
              className="flex-1 py-4 border-white/10" 
              onClick={() => setPreviewImage(null)}
            >
              Retake
            </ThreeDButton>
            <ThreeDButton 
              variant="primary" 
              className="flex-1 py-4" 
              onClick={handleConfirm}
            >
              Confirm
            </ThreeDButton>
          </div>
        ) : null}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
