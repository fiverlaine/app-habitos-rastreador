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
          <div className={`animate-pulse bg-slate-900/40 backdrop-blur-sm rounded-3xl p-5 flex items-center justify-between border border-slate-800/50 ${className}`}>
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 bg-slate-800/60 rounded-2xl"></div>
              <div className="flex-1">
                <div className="h-5 bg-slate-800/60 rounded-lg w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-800/60 rounded-lg w-1/2"></div>
              </div>
            </div>
            <div className="w-14 h-14 bg-slate-800/60 rounded-2xl"></div>
          </div>
        );
      
      case 'stats':
        return (
          <div className={`animate-pulse bg-slate-900/40 backdrop-blur-sm rounded-3xl p-6 border border-slate-800/50 ${className}`}>
            <div className="flex items-center justify-center mb-4">
              <div className="w-36 h-36 bg-slate-800/60 rounded-full"></div>
            </div>
            <div className="text-center">
              <div className="h-10 bg-slate-800/60 rounded-xl w-32 mx-auto mb-2"></div>
              <div className="h-5 bg-slate-800/60 rounded-lg w-24 mx-auto"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
                  <div className="h-8 bg-slate-800/60 rounded-lg w-12 mx-auto mb-2"></div>
                  <div className="h-4 bg-slate-800/60 rounded-lg w-16 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-4 bg-slate-800/60 rounded-lg w-full mb-2"></div>
            <div className="h-4 bg-slate-800/60 rounded-lg w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-800/60 rounded-lg w-1/2"></div>
          </div>
        );
      
      case 'circle':
        return (
          <div className={`animate-pulse bg-slate-800/60 rounded-full ${className}`}></div>
        );
      
      default:
        return <div className={`animate-pulse bg-slate-800/60 rounded-xl ${className}`}></div>;
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
