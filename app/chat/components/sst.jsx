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
    window.location.href = 'https://glynne-sst-ai-hsiy.vercel.app/GLY_SALES_AGENTS';
  };

  return (
    <div
      className="w-full max-w-xs mx-auto bg-white shadow-md  mb-[30px] p-5 text-center"
      style={{
        backgroundImage: "url('https://i.pinimg.com/1200x/41/d4/b4/41d4b43b87971efc50800e692b6a53fc.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <h2 className="text-lg font-bold text-gray-while">
        Impulsa tu negocio
      </h2>
  
      <p className="text-[11px] text-gray-400 mt-1 italic">
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
