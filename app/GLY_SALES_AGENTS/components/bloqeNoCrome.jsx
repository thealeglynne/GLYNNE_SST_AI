'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const Alert = () => {
  const [showAlert, setShowAlert] = useState(false);
  
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    const isNotChrome = !navigator.userAgent.includes('Chrome');

    if (isMobile || isNotChrome) {
      setShowAlert(true);
    }
  }, []);

  if (!showAlert) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-[100] p-4 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white bg-cover bg-center rounded-3xl shadow-2xl w-[90vw]  h-[90vh] flex flex-col items-center justify-center text-white"
          style={{ backgroundImage: "url('https://i.pinimg.com/originals/59/89/b7/5989b7149f2d899ac53c1078bdddc919.gif')" }}
          initial={{ scale: 0.95, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 40 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="w-full flex flex-col items-center justify-center gap-[2vh]">
            <Image
              src="/logo.png"
              alt="Logo GLY-IA"
              width={70}
              height={70}
              className="mt-[-8px]"
            />
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-bold text-center"
              style={{
                fontSize: 'clamp(1.2rem, 2vw, 1.8rem)',
                lineHeight: '1.3',
              }}
            >
              <span className="text-white">Dispositivo o navegador no compatible</span>
            </motion.h2>
            <p
              className="text-center max-w-[50ch]"
              style={{
                fontSize: 'clamp(0.7rem, 1vw, 0.9rem)',
                lineHeight: '1.6',
              }}
            >
              Para una experiencia óptima con nuestro asistente, te recomendamos usar un computador **Google Chrome**.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Alert;