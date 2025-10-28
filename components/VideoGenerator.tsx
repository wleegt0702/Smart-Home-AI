
import React, { useState, useEffect, useRef } from 'react';
import { generateVideo, fileToBase64 } from '../services/geminiService';
import { UploadIcon } from './icons/Icons';

// FIX: Add global declaration for window.aistudio, used by this component.
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const loadingMessages = [
  "Warming up the video engines...",
  "Gathering pixels and frames...",
  "Directing the digital actors...",
  "Rendering cinematic magic...",
  "Adding the final touches...",
  "This can take a few minutes, please wait..."
];

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkApiKey();
  }, []);

  // FIX: Replaced NodeJS.Timeout with inferred type and fixed logic bug.
  useEffect(() => {
    if (isLoading) {
      setLoadingMessage(loadingMessages[0]);
      let i = 1;
      const interval = setInterval(() => {
        setLoadingMessage(loadingMessages[i % loadingMessages.length]);
        i++;
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const checkApiKey = async () => {
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const keyStatus = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(keyStatus);
    }
  };
  
  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        // Assume key selection is successful to avoid race conditions
        setHasApiKey(true);
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setVideoUrl(null);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!imageFile) {
      setError('Please upload an image.');
      return;
    }
    if (!hasApiKey) {
      setError('Please select an API key first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    try {
      const imageBase64 = await fileToBase64(imageFile);
      const generatedUrl = await generateVideo(prompt, imageBase64, imageFile.type, aspectRatio);
      setVideoUrl(generatedUrl);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(errorMessage);
        if (errorMessage.includes('Requested entity was not found')) {
            setError("API key not found or invalid. Please select a valid key.");
            setHasApiKey(false);
        }
        console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="max-w-2xl mx-auto text-center bg-gray-800 p-8 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">API Key Required for Video Generation</h2>
        <p className="text-gray-400 mb-6">
          Veo video generation requires a valid API key. Please select your key to proceed. 
          For information on billing, visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">ai.google.dev/gemini-api/docs/billing</a>.
        </p>
        <button
          onClick={handleSelectKey}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
        >
          Select API Key
        </button>
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Video Generation from Image</h2>
      <p className="text-gray-400 mb-6">Upload an image, add an optional prompt, and generate a short video using the Veo model.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-xl space-y-4">
          <div>
            <label className="font-semibold mb-2 block">1. Upload Image</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-gray-700/50 transition-colors"
            >
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-md" />
              ) : (
                <div className="text-gray-400">
                  <UploadIcon className="w-10 h-10 mx-auto mb-2" />
                  <p>Click to upload or drag & drop</p>
                </div>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="prompt" className="font-semibold mb-2 block">2. Add a Prompt (Optional)</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A neon hologram of a cat driving at top speed"
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              rows={2}
            />
          </div>
          <div>
            <label className="font-semibold mb-2 block">3. Select Aspect Ratio</label>
            <div className="flex gap-4">
              {['16:9', '9:16'].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio as '16:9' | '9:16')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${aspectRatio === ratio ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  {ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !imageFile}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
          >
            Generate Video
          </button>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl flex items-center justify-center">
          {isLoading && (
            <div className="text-center">
              <svg className="animate-spin h-10 w-10 text-blue-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-lg font-semibold">{loadingMessage}</p>
            </div>
          )}
          {error && <p className="text-red-400 text-center">{error}</p>}
          {videoUrl && (
            <video src={videoUrl} controls autoPlay loop className="w-full rounded-lg" />
          )}
          {!isLoading && !error && !videoUrl && <p className="text-gray-400">Your generated video will appear here.</p>}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;
