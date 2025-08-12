'use client';

import { useEffect, useState } from 'react';
import { LoginPopup } from './LoginPopup';

export default function Main1() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animación inicial del logo
  useEffect(() => {
    const timeout = setTimeout(() => setShowLogo(true), 1000);
    return () => clearTimeout(timeout);
  }, []);

  // Función para "despertar" los backends
  const wakeUpServices = async () => {
    setLoading(true);
    try {
      // URLs de los backends
      const urls = [
        'https://gly-ai-brain.onrender.com/',
        'https://gly-tts-back.onrender.com/'
      ];

      // Ejecutar las peticiones en paralelo
      await Promise.all(
        urls.map(async (url) => {
          try {
            const res = await fetch(url, { method: 'GET' });
            console.log(`Wake-up OK: ${url}`, await res.json());
          } catch (err) {
            console.warn(`Error al despertar ${url}`, err);
          }
        })
      );
    } finally {
      setLoading(false);
      setShowLoginModal(true);
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden font-inter">
      {/* Video de fondo */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/presentacion.mp4" type="video/mp4" />
      </video>

      {/* Capa oscura */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Contenido */}
      <div className="relative z-20 w-full h-full flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-xl p-6 sm:p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl text-white text-center space-y-4">
          <img
            src="/logo.png"
            alt="Logo GLY-IA"
            className={`w-16 sm:w-20 mx-auto transition-all duration-1000 ${
              showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
          />

          <h2 className="text-sm sm:text-base font-medium">
            Tu <span className="font-bold text-white">Asesor IA Personal</span> te espera
          </h2>

          <p className="text-xs sm:text-sm text-white/80">
            Conecta con un experto que analizará tu negocio y te mostrará cómo aplicar Inteligencia Artificial de manera efectiva en tus operaciones.
          </p>

          <p className="text-xs sm:text-sm text-white/80">
            Recibe ideas claras y personalizadas para que la IA se adapte a tu flujo de trabajo y potencie tus resultados desde el primer día.
          </p>

          <button
            onClick={() => {
              localStorage.removeItem('glyiaChatClosed');
              wakeUpServices();
            }}
            disabled={loading}
            className="relative mt-2 px-6 py-3 text-sm font-semibold bg-white text-black rounded-xl shadow-xl group overflow-hidden transition-all disabled:opacity-50"
          >
            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            <span className="relative z-10">
              {loading ? 'Conectando...' : 'Hablar con mi Asesor IA'}
            </span>
          </button>
        </div>
      </div>

      {/* Popup separado */}
      <LoginPopup visible={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </main>
  );
}
