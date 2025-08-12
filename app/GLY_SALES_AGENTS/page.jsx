'use client';

import { useState, useEffect } from 'react';
import ModalInicio from './components/madalInicio';
import ChatLLM from './components/ChatLLM';
import Header from './components/header';
import ColdStartLoader from './components/cargando'; // Importa el componente de carga

const COLD_START_TIME = 8000; // 8 segundos de espera para el backend
const SESSION_KEY = 'glynne_first_visit';

export default function Diagnostico() {
  const [datosEmpresa, setDatosEmpresa] = useState(null);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    // Comprueba si es la primera visita en esta sesión del navegador
    if (!sessionStorage.getItem(SESSION_KEY)) {
      setShowLoader(true);
      // Establece la clave en sessionStorage para que no se muestre de nuevo al refrescar
      sessionStorage.setItem(SESSION_KEY, 'true');

      const timer = setTimeout(() => {
        setShowLoader(false);
      }, COLD_START_TIME);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="relative min-h-screen ">
      <Header />
      
      {/* 1. Muestra el loader de cold start solo si showLoader es true */}
      

      {/* 2. Muestra el modal de inicio o el chat cuando el loader no está activo */}
      {!showLoader && (
        <>
          {!datosEmpresa && <ModalInicio onComplete={setDatosEmpresa} />}
          {datosEmpresa && <ChatLLM empresa={datosEmpresa} />}
        </>
      )}
    </div>
  );
}