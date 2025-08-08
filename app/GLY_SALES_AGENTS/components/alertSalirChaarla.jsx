'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertSalida() {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Mostrar inmediatamente al cargar
    setShowAlert(true);
    const hideTimeout = setTimeout(() => setShowAlert(false), 10000);

    // Repetir cada 5 minutos
    const interval = setInterval(() => {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 8000);
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(hideTimeout);
    };
  }, []);

  return (
    <AnimatePresence>
      {showAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="fixed top-4 right-4 mt-[30px] bg-white text-black shadow-md rounded-lg px-4 py-2 text-sm border border-gray-200"
          style={{
            fontFamily: 'sans-serif',
            maxWidth: '260px',
          }}
        >
          <p className="leading-snug">
            Cuando quiera salir de la conversación, solo hazle saber al asistente que quiere salir.
            No cierre sesión sin salir del asistente.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
