import React from 'react';
import { Clock } from 'lucide-react';

interface LastUploadIndicatorProps {
  lastUploadTime: number | null;
  getTimeAgo: (timestamp: number) => string;
}

const LastUploadIndicator: React.FC<LastUploadIndicatorProps> = ({ lastUploadTime, getTimeAgo }) => {
  if (!lastUploadTime) return null;

  return (
    <div className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg">
      <div className="relative flex items-center justify-center">
        <Clock size={16} className="text-green-600 dark:text-green-400" />
        <div className="absolute inset-0 rounded-full animate-pulse bg-green-400/20"></div>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-green-700 dark:text-green-300">Último upload</span>
        <span className="text-xs text-green-600 dark:text-green-400">{getTimeAgo(lastUploadTime)}</span>
      </div>
    </div>
  );
};

export default LastUploadIndicator;