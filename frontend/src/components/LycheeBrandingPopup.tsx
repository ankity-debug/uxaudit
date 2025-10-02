import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LycheeBrandingPopupProps {
  isVisible: boolean;
  loadingStep: number;
  loadingSteps: string[];
}

const LycheeBrandingPopup: React.FC<LycheeBrandingPopupProps> = ({
  isVisible,
  loadingStep,
  loadingSteps
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Popup Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white relative rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl"
            >
              {/* Content */}
              <div className="flex flex-col items-center relative">
                <div className="box-border flex flex-col items-center pb-6 pt-16 px-6 md:px-8 relative w-full">

                  {/* Lychee Image */}
                  <div className="relative w-full max-w-md mb-8 flex justify-center">
                    <img
                      src="/lychee.png"
                      alt="Lychee illustration representing layered insights"
                      className="w-64 h-auto object-contain drop-shadow-lg"
                    />
                  </div>

                  {/* Brand Story Text */}
                  <div className="flex flex-col font-['Inter',_sans-serif] font-normal leading-relaxed text-center max-w-xl text-gray-800 text-base md:text-lg tracking-wide mb-8">
                    <p className="leading-[1.6]">
                      Lychee is a fruit that looks simple on the outside but reveals a juicy,
                      layered sweetness within—just like a website UX audit that uncovers
                      hidden insights beneath the surface. It complements Lemon Yellow LLP's
                      "Zesty Clarity" with its own depth and freshness & rich in Vitamin C.
                    </p>
                  </div>

                  {/* Animated Loading Text at Bottom */}
                  <div className="w-full flex items-center justify-center py-6 bg-gradient-to-t from-gray-50 to-transparent rounded-b-xl">
                    <div className="flex items-center space-x-3">
                      {/* Animated Dots */}
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-pink-500 rounded-full"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-pink-500 rounded-full"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-pink-500 rounded-full"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>

                      {/* Cycling Text */}
                      <motion.span
                        key={loadingStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="text-gray-700 font-medium text-sm md:text-base"
                      >
                        {loadingSteps[loadingStep]}
                      </motion.span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LycheeBrandingPopup;
