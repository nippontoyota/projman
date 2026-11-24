'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TopLoaderProps {
  isLoading: boolean;
}

export const TopLoader: React.FC<TopLoaderProps> = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-slate-100 overflow-hidden pointer-events-none">
          {/* Main animated progress bar with sleek black accent */}
          <motion.div
            className="h-full bg-black shadow-[0_0_8px_rgba(0,0,0,0.3)]"
            initial={{ x: '-100%' }}
            animate={{
              x: ['-100%', '0%', '100%'],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: 'easeInOut',
            }}
            style={{ width: '60%' }}
          />
        </div>
      )}
    </AnimatePresence>
  );
};
