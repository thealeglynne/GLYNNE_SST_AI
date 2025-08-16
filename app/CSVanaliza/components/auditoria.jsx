'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

export default function BienvenidaUsuario() {
  const [userInfo, setUserInfo] = useState({
    nombre: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error obteniendo usuario:', userError);
        setLoading(false);
        return;
      }

      const { user_metadata } = user;

      setUserInfo({
        nombre: user_metadata?.full_name || 'Usuario',
      });

      setLoading(false);
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return <div className="text-white text-center py-8">Cargando...</div>;
  }

  const handleRedirect = () => {
    window.location.href = 'https://glynne-sst-ai-hsiy.vercel.app/chat';
  };

  return (
    <div
      className="w-full max-w-xs mx-auto bg-white shadow-md rounded-2xl p-5 text-center border border-gray-100"
      style={{
        backgroundImage: "url('https://i.pinimg.com/736x/50/ab/12/50ab1273f48ae11bd7e8c150dfe2ba8c.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <h2 className="text-lg font-bold text-white text-gray-while">
        Impulsa tu negocio
      </h2>
  
      <p className="text-[11px] text-white mt-1 italic">
        {userInfo.nombre}
      </p>

      <div className="pt-4 flex flex-col items-center">
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.03 }}
          onClick={handleRedirect}
          className={`relative overflow-hidden px-6 py-3 rounded-full font-semibold text-white transition bg-black hover:bg-gray-900`}
          style={{ fontSize: 'clamp(0.7rem, 1vw, 0.9rem)' }}
        >
          {/* Efecto barrido de luz */}
          <span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                       translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 ease-in-out"
          />
          Generar Auditoría Gratuita
        </motion.button>
      </div>
    </div>
  );
}
