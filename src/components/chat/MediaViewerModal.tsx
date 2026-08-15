import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';

interface MediaViewerModalProps {
  mediaUrl: string | null;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ mediaUrl, onClose }) => {
  return (
    <AnimatePresence>
      {mediaUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          {/* Close & Download Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <a
              href={mediaUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Media Content */}
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            src={mediaUrl}
            alt="Preview"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </AnimatePresence>
  );
};
