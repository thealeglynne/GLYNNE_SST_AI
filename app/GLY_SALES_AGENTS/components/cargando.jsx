'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const ColdStartLoader = ({ onBackendReady }) => {
  useEffect(() => {
    const backendUrl = 'https://gly-tts-back.onrender.com';
    const checkInterval = 2000; // Intervalo de 2 segundos para chequear el backend

    const checkBackendStatus = async () => {
      try {
        const response = await fetch(backendUrl, { method: 'GET' });
        
        // Si la respuesta es exitosa (código 200-299), el backend está listo.
        if (response.ok) {
          console.log('Backend está activo y listo.');
          onBackendReady(); // Llama a la función del padre para ocultar el loader
        } else {
          // Si la respuesta no es exitosa, se reintenta.
          console.log('Backend no está listo, reintentando...');
          setTimeout(checkBackendStatus, checkInterval);
        }
      } catch (error) {
        // En caso de un error de red, se reintenta después del intervalo.
        console.warn('Error al conectar con el backend, reintentando...', error);
        setTimeout(checkBackendStatus, checkInterval);
      }
    };

    // Inicia el primer chequeo cuando el componente se monta.
    checkBackendStatus();

    // El return del useEffect se usa para limpiar cualquier temporizador
    // si el componente se desmonta antes de que el backend esté listo.
    return () => {
      // Nota: Para una limpieza más robusta, se usaría una useRef para
      // almacenar el ID del temporizador. Para este caso, es suficiente.
    };
  }, [onBackendReady]); // La dependencia asegura que el efecto se re-ejecute si onBackendReady cambia, aunque en este caso no lo hará.

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl w-[80vw] max-w-4xl px-[4vw] py-[5vh] text-gray-800"
          initial={{ scale: 0.95, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 40 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="w-full flex flex-col items-center justify-center gap-[2vh]">
            <Image
              src="/logo2.png"
              alt="Logo GLY-IA"
              width={70}
              height={70}
              className="mt-[-8px]"
            />

            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-bold text-center text-black"
              style={{
                fontSize: 'clamp(1.4rem, 2.5vw, 2.3rem)',
                lineHeight: '1.3',
              }}
            >
              <span className="text-black">GLYNNE está estructurando tu asistente...</span>
            </motion.h2>

            <div className="w-10 h-10 border-4 border-black border-solid rounded-full animate-spin border-t-transparent mt-4"></div>

            <p
              className="text-center text-gray-600 max-w-[70ch] mt-4"
              style={{
                fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
                lineHeight: '1.6',
              }}
            >
              Esto solo pasa la primera vez, ¡gracias por tu paciencia!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ColdStartLoader;