import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title, 
  message 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transform transition-all scale-100">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="text-amber-600 dark:text-amber-500" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Confirm Load
          </button>
        </div>
      </div>
    </div>
  );
};
