'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers,
  FaBriefcase,
  FaRobot,
  FaCog,
  FaMoneyBillWave,
} from 'react-icons/fa';

const departments = [
  {
    key: 'ventas',
    name: 'Ventas',
    icon: FaBriefcase,
    content: `
En los departamentos de ventas tradicionales, el seguimiento manual de prospectos, la mala calificación de leads y la pérdida de oportunidades son problemas comunes. Estos obstáculos ralentizan el crecimiento y generan costos innecesarios.

GLYNNE automatiza tu funnel de ventas con scoring inteligente, CRM con inteligencia artificial y bots de seguimiento proactivos. Esto significa que tus equipos se enfocan solo en prospectos de alto valor mientras la IA gestiona tareas repetitivas.

Desde la auditoría del proceso actual hasta la integración con sistemas como HubSpot o Salesforce, implementamos predicción con modelos LLM y orquestamos workflows automatizados para aumentar tu conversión hasta en un 40%.`,
  },
  {
    key: 'rh',
    name: 'Recursos Humanos',
    icon: FaUsers,
    content: `
La selección de talento y el onboarding pueden volverse cuellos de botella si no están optimizados. Reclutar lleva semanas, los procesos son inconsistentes y la rotación aumenta.

Con GLYNNE, implementamos reclutamiento basado en IA, onboarding guiado por agentes inteligentes y monitoreo de clima laboral en tiempo real. Esto permite identificar problemas antes de que se agraven.

Desde formularios inteligentes hasta flujos con LLMs y herramientas como n8n, tu departamento de RR.HH. pasa de ser reactivo a ser predictivo. Reducimos el tiempo de contratación a la mitad y mejoramos la retención notablemente.`,
  },
  {
    key: 'soporte',
    name: 'Soporte',
    icon: FaRobot,
    content: `
El soporte técnico suele ser un punto crítico: tickets desordenados, respuestas tardías y clientes frustrados. Una experiencia deficiente puede costarte clientes.

GLYNNE transforma tu soporte con clasificación automática de solicitudes, respuestas contextuales con modelos LLM y dashboards de métricas en tiempo real.

Conectamos plataformas como Zendesk o Freshdesk, automatizamos respuestas frecuentes y damos trazabilidad total al flujo de atención. El resultado: un 60% menos en tiempos de resolución y un mejor NPS.`,
  },
  {
    key: 'operaciones',
    name: 'Operaciones',
    icon: FaCog,
    content: `
Los procesos operativos suelen estar fragmentados entre herramientas, departamentos y personas. Esto genera errores humanos, retrabajo y una falta crítica de trazabilidad.

Automatizamos y orquestamos tus flujos operativos usando tecnologías como Supabase, LangChain y n8n. Implementamos validaciones automáticas, alertas inteligentes y pipelines que se adaptan al cambio.

Así, GLYNNE convierte operaciones caóticas en sistemas resilientes, escalables y trazables. Donde antes había desorden, ahora hay eficiencia y control.`,
  },
  {
    key: 'finanzas',
    name: 'Finanzas',
    icon: FaMoneyBillWave,
    content: `
El análisis financiero manual no solo es lento, también propenso a errores. Las proyecciones pueden estar desactualizadas y los informes llegan tarde, limitando la toma de decisiones.

GLYNNE introduce predicción de flujo de caja con IA, generación automática de reportes y monitoreo en tiempo real de KPIs financieros clave.

Integramos con ERPs y CRMs para automatizar conciliaciones, detectar anomalías y prever riesgos. Así, el área financiera se convierte en un motor estratégico, no solo operativo.`,
  },
];

export default function MainAutomationShowcase() {
  const [activeDept, setActiveDept] = useState('ventas');
  const current = departments.find(dep => dep.key === activeDept);

  return (
    <section className="w- min-h-screen flex items-center justify-center bg-white px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-16">
      <div className="w-full max-w-7xl flex flex-col items-center justify-center gap-10">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-black text-center px-4"
        >
          Automatización Inteligente por Departamentos
        </motion.h2>

        {/* Botones */}
        <div className="flex flex-wrap justify-center gap-3 w-full">
          {departments.map(dep => {
            const Icon = dep.icon;
            const isActive = activeDept === dep.key;
            return (
              <button
                key={dep.key}
                onClick={() => setActiveDept(dep.key)}
                className={`relative group overflow-hidden px-4 py-2 rounded-full border transition-all flex items-center gap-2
                  ${isActive
                    ? 'bg-orange-500 text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={`text-xl sm:text-2xl transition-colors ${isActive ? 'text-white' : 'text-orange-500'}`} />
                  <span className="font-medium">{dep.name}</span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              </button>
            );
          })}
        </div>

        {/* Contenido dinámico */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-white p-6 sm:p-8 md:p-10 rounded-3xl shadow-xl border border-gray-200 text-left"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-black text-center mb-6">{current.name}</h3>
            <div className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed space-y-5 text-justify">
              {current.content
                .trim()
                .split('\n')
                .filter(p => p.trim())
                .map((para, i) => <p key={i}>{para.trim()}</p>)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}