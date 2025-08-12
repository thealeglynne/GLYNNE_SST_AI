'use client';

import React, { useEffect, useState } from 'react';
import Menu from '../menu/components/menu';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wakeUpServers = async () => {
      try {
        await Promise.all([
          fetch('https://gly-ai-brain.onrender.com', { method: 'GET' }),
          fetch('https://gly-tts-back.onrender.com/conversar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto: 'ping' })
          })
        ]);
      } catch (error) {
        console.error('Error al despertar los servicios:', error);
      } finally {
        setLoading(false);
      }
    };

    wakeUpServers();
  }, []);

  return (
    <div className="min-h-screen bg-white p-0 m-0 relative flex flex-col">
      {/* Loader mientras despierta el backend */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 h-screen w-screen flex flex-col items-center justify-center bg-white z-50"
          >
            {/* Logo con animación de pulso */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="mb-6"
            >
              <Image
                src="/logo2.png" // Asegúrate de tenerlo en /public/logo.png
                alt="GLYNNE Logo"
                width={80}
                height={80}
                priority
              />
            </motion.div>

            {/* Círculo de carga naranja */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full"
            />

            {/* Texto */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-orange-600 font-semibold text-lg text-center"
            >
              Activando servicios...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido del menú */}
      <Menu />
    </div>
  );
}
