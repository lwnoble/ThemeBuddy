import React from 'react';
import { Check } from 'lucide-react';


export interface LoadingScreenProps {
  steps: Array<{
    label: string;
    status: 'pending' | 'loading' | 'complete';
  }>;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ steps }) => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center max-w-md w-full">
        {/* Animated Dog */}
        <div>
          <img 
            src="../../../../public/assets/images/Puppyrun.gif" 
            alt="Puppy running to fetch your desing system"
            className="w-full h-auto" // Tailwind classes for responsive sizing
          />
        </div>
        
        {/* Steps */}
        <div className="w-full space-y-4 mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100">
              <div className="flex items-center">
                <div className="relative flex items-center justify-center mr-4">
                  {step.status === 'complete' ? (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : step.status === 'loading' ? (
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-200 rounded-full" />
                  )}
                </div>
                <span className={`font-medium ${
                  step.status === 'complete' 
                    ? 'text-green-500' 
                    : step.status === 'loading' 
                      ? 'text-purple-500'
                      : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Message */}
        <p className="text-lg text-gray-800 text-center">
          We are creating your Design System
          <span className="block text-sm text-gray-500 mt-2">
            This might take a few moments
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;