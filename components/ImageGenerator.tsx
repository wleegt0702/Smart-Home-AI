
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setImage(null);
    try {
      const imageUrl = await generateImage(prompt);
      setImage(imageUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Image Generation</h2>
      <p className="text-gray-400 mb-6">Create stunning images from text descriptions using the Imagen 4 model. Let your imagination run wild!</p>
      
      <div className="bg-gray-800 p-6 rounded-xl space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A cinematic shot of a raccoon astronaut in a retro space suit, with a galaxy in the background"
          className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          rows={3}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Image'
          )}
        </button>
      </div>

      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      
      <div className="mt-8">
        {image && (
          <div className="bg-gray-800 p-4 rounded-xl">
            <img src={image} alt="Generated" className="w-full max-w-lg mx-auto rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
