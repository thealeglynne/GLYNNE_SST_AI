'use client'

import React, { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import Perfil from '../components/perfil'
import Recomendaciones from './preguntasPredefinidas'
import Auditoria from './auditoria'
import CsvAnalizer from '../components/csvAnalicer'
const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative h-screen">
      {/* Botón hamburguesa */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute top-4 left-4 z-50 p-3 rounded-md transition-colors duration-300 ${
          isOpen ? 'bg-gray-500' : 'bg-white'
        }`}
      >
        {isOpen ? (
          <FaTimes className="text-white text-xl" />
        ) : (
          <FaBars className="text-black text-xl" />
        )}
      </button>

      {/* Menú lateral */}
      <div
        className={`fixed top-0 left-0 h-full z-40 bg-white transition-all duration-500 ease-in-out overflow-hidden
          ${isOpen ? 'block' : 'hidden'} 
          w-full sm:w-[30vw] sm:max-w-[400px] sm:min-w-[240px]`}
      >
        {/* Contenido con scroll */}
        <div className="h-full p-6 overflow-y-auto text-black flex flex-col gap-6 mt-[20px]">
          <Perfil />
          <Auditoria />
          <CsvAnalizer />
          <Recomendaciones />

          {/* Footer */}
          <div
  className="mt-auto text-center text-xs text-gray-500 border-t border-gray-200 flex flex-col items-center justify-center"
  style={{ height: '300px', padding: '20px' }}
>
  <div className="font-semibold">© GLYNNE 2025</div>
  <div>Innovación impulsada por inteligencia artificial</div>
</div>
        </div>
      </div>
    </div>
  )
}

export default SideMenu
