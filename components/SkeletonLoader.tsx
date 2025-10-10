import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'habit' | 'stats' | 'text' | 'circle';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  variant = 'habit', 
  count = 1 
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'habit':
        return (
          <div className={`animate-pulse bg-slate-800 rounded-2xl p-4 flex items-center justify-between border border-slate-700 ${className}`}>
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-slate-700 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-5 bg-slate-700 rounded-md w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded-md w-1/2"></div>
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
          </div>
        );
      
      case 'stats':
        return (
          <div className={`animate-pulse bg-slate-800 rounded-xl p-6 border border-slate-700 ${className}`}>
            <div className="flex items-center justify-center mb-4">
              <div className="w-32 h-32 bg-slate-700 rounded-full"></div>
            </div>
            <div className="text-center">
              <div className="h-8 bg-slate-700 rounded-md w-24 mx-auto mb-2"></div>
              <div className="h-4 bg-slate-700 rounded-md w-16 mx-auto"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-900/60 p-4 rounded-xl">
                  <div className="h-6 bg-slate-700 rounded-md w-12 mx-auto mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded-md w-16 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-4 bg-slate-700 rounded-md w-full mb-2"></div>
            <div className="h-4 bg-slate-700 rounded-md w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-700 rounded-md w-1/2"></div>
          </div>
        );
      
      case 'circle':
        return (
          <div className={`animate-pulse bg-slate-700 rounded-full ${className}`}></div>
        );
      
      default:
        return <div className={`animate-pulse bg-slate-700 rounded ${className}`}></div>;
    }
  };

  if (count > 1) {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
          <div key={i}>
            {renderSkeleton()}
          </div>
        ))}
      </div>
    );
  }

  return renderSkeleton();
};

export default SkeletonLoader;
