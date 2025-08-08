'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars } from 'react-icons/fa';
import Perfil from '../../GLY_SALES_AGENTS/components/perfil';
import Recomendacciion from '../../GLY_SALES_AGENTS/components/preguntasPredefinidas';
import PanelProgramar from './comonents/panelProgramer';

export default function PanelEducativo() {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 1000);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    setIsClient(true);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-white flex relative overflow-hidden">
      {/* Sidebar */}
      {isMobile && (
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="absolute top-4 left-4 z-50 bg-orange-500 text-white p-2 rounded-full shadow-lg"
        >
          <FaBars />
        </button>
      )}

      <AnimatePresence>
        {(menuOpen || !isMobile) && (
          <motion.aside
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`${
              isMobile ? 'fixed top-0 left-0 z-40 w-2/3 h-full' : 'w-1/4 h-full'
            } overflow-y-auto border-r border-gray-200 bg-white p-4 flex flex-col gap-3 sidebar-content`}
          >
            <Perfil />
            <Recomendacciion />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 h-screen overflow-hidden p-4">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-6xl mx-auto h-full bg-gray-50 rounded-2xl shadow-md overflow-hidden flex flex-col"
        >
          {/* Video: 2/3 */}
          <div className="flex-grow-[2] bg-black">
            {isClient && (
              <iframe
                src="/Vectores.mp4"
                title="Video educativo"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Consola: 1/3 */}
          <div className="flex-grow bg-white px-4 py-4 border-t border-gray-200 overflow-y-auto">
            <PanelProgramar />
          </div>
        </motion.section>
      </div>
    </div>
  );
}
