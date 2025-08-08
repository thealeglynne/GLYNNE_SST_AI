'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaComments,
  FaLightbulb,
  FaKeyboard,
  FaVolumeUp,
  FaBrain,
  FaCogs,
} from 'react-icons/fa';

const pasos = [
  {
    label: '1. Háblame como si ya me conocieras',
    icon: <FaLightbulb className="text-orange-500 text-lg" />,
    descripcion:
      'No hace falta decir hola ni contarme quién eres. Solo dime lo que te preocupa, qué quieres automatizar o qué necesitas resolver. Yo ya estoy lista para ayudarte.',
  },
  {
    label: '2. Usa tu forma natural de hablar',
    icon: <FaVolumeUp className="text-orange-500 text-lg" />,
    descripcion:
      'Olvida los tecnicismos o frases complicadas. Háblame como si estuviéramos en una llamada. Cuanto más natural suene tu voz, mejor entenderé lo que necesitas.',
  },
  {
    label: '3. Dime directamente qué necesitas',
    icon: <FaKeyboard className="text-orange-500 text-lg" />,
    descripcion:
      'No necesitas darme contexto ni explicaciones largas. Solo dime qué quieres lograr. Si me falta información, te haré preguntas claras para ayudarte mejor.',
  },
  {
    label: '4. Un tema por vez, por favor',
    icon: <FaBrain className="text-orange-500 text-lg" />,
    descripcion:
      'Para ayudarte bien, prefiero que hablemos de una sola cosa por mensaje. Si tienes varias dudas, dime una ahora, y después seguimos con la siguiente.',
  },
  {
    label: '5. Cuéntame cómo trabaja tu equipo',
    icon: <FaCogs className="text-orange-500 text-lg" />,
    descripcion:
      'Si me cuentas qué herramientas usan, qué tareas hacen a mano o qué cosas les toman mucho tiempo, puedo darte ideas concretas para automatizar y optimizar.',
  },
  {
    label: '6. No me preguntes por precios ni citas',
    icon: <FaComments className="text-orange-500 text-lg" />,
    descripcion:
      'Yo no manejo precios ni agendo reuniones. Para eso podés visitar la web. Estoy aquí para ayudarte a pensar soluciones, mejorar procesos y automatizar lo importante.',
  },
];


export default function InstruccionesCursoIA() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="w-full max-w-[500px] mx-auto p-4 space-y-4 bg-white rounded-2xl shadow-lg border border-gray-200">
      <motion.h2
        className="text-lg font-bold text-center text-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        ¿Cómo hablar con GLYNNE?
      </motion.h2>

      <p className="text-sm text-gray-500 text-center">
        GLYNNE es una asesora experta en automatización con IA. Le responderá como si ya estuvieran en una llamada, así que siga estas indicaciones para aprovechar al máximo la experiencia.
      </p>

      <div className="flex flex-col gap-3">
        {pasos.map((item, index) => (
          <motion.div
            key={index}
            onClick={() => setActiveIndex(index)}
            className="bg-white border border-gray-300 rounded-xl p-3 cursor-pointer hover:shadow-md transition"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-start gap-2 text-sm font-semibold text-gray-700">
              {item.icon}
              <span>{item.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* POPUP CON DETALLE */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            className="fixed inset-0 backdrop-blur-sm bg-white/40 z-50 flex items-center justify-center px-4"
            onClick={() => setActiveIndex(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white max-w-sm w-full rounded-xl p-5 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3 className="text-md font-bold mb-2 text-gray-800">
                {pasos[activeIndex].label}
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {pasos[activeIndex].descripcion}
              </p>
              <button
                onClick={() => setActiveIndex(null)}
                className="absolute top-2 right-3 text-lg font-bold text-gray-400 hover:text-black"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
