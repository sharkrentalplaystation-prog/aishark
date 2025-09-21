
import React, { useState, ReactNode } from 'react';
import { ChevronDownIcon } from './icons';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  isOpenDefault?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, isOpenDefault = false }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  return (
    <div className="border border-gray-700 rounded-lg mb-4 bg-gray-800/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg"
      >
        <span>{title}</span>
        <ChevronDownIcon
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 border-t border-gray-700">{children}</div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
