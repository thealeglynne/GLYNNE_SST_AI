'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '../../GLY_SALES_AGENTS/components/header';

export default function Sections() {
  const router = useRouter();

  const cards = [
    {
        type: 'consulting',
        title: '¿no sabes como integrar ia?',
        subtitle: 'hablame ',
        link: '/GLY_SALES_AGENTS',
        colSpan: 3,
        height: 350,
        bgImage: '/av.png',
      }
      ,
    {
      type: 'construye tu auditoria',
      title: 'construye tu auditoria',
      subtitle: 'escribeme',
      link: '/chat',
      colSpan: 3,
      height: 350,
      bgImage:
        '/ssalaG.png',
    },
    {
      type: 'Analiza tus bases de datos y encuentra que tan optimizzadas estan',
      title: 'sube la DB de tu negocio',
      subtitle: 'Analiza tus bases de datos y encuentra que tan optimizadas estan',
      link: '/CSVanaliza',
      colSpan: 2,
      height: 300,
      bgImage:
        '/nena.png',
    },
    {
      type: 'bigdata',
      title: 'Big Data',
      subtitle: 'Manage bulk data for your business',
      link: '/big-data',
      colSpan: 2,
      height: 300,
      bgImage:
        '/fort.png',
    },
    {
      type: 'smartlife',
      title: 'Smart Tech Smart Life',
      subtitle: 'We make your life easier',
      link: '/smart-tech',
      colSpan: 2,
      height: 300,
      bgImage:
        '/des.png',
    },
  ];

  return (
    <div className="w-full min-h-screen text-black px-4 py-20  flex flex-col items-center">
      <Header />

      {/* Título más pequeño */}
      <h2 className="text-center text-2xl md:text-3xl font-semibold mb-6 max-w-7xl">
       GLYNNE SERVICES
      </h2>

      {/* Logo debajo del título */}
      <div className="mb-6 flex justify-center">
        <img src="/logo2.png" alt="Logo CleanAI" className="h-10 w-auto object-contain" />
      </div>

      {/* Texto con gancho, más persuasivo */}
      <p className="max-w-4xl text-center text-gray-800 text-lg mb-12 px-4 leading-relaxed">
  En la era de la <span className="font-semibold">IA</span>, lidera o quédate atrás.<br />
  Potencia tu negocio con <span className="font-semibold">soluciones inteligentes</span> y acesoramiento  de vanguardia.
</p>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 max-w-7xl w-full">
        {cards.map(({ type, title, subtitle, link, colSpan, height, bgImage }, idx) => (
          <motion.div
            key={type}
            onClick={() => router.push(link)}
            className={`relative text-white shadow-md rounded-md cursor-pointer hover:scale-[1.01] transition-all duration-300 flex flex-col justify-end overflow-hidden`}
            style={{
              gridColumn: `span ${colSpan}`,
              height: `${height}px`,
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-black/60 p-8 flex flex-col justify-end rounded-md">
              <h3 className="text-2xl font-bold mb-2">{title}</h3>
              <p className="text-sm mb-3">{subtitle}</p>
              <span className="text-sm font-medium underline">Ver más →</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-16 w-full max-w-7xl text-center text-gray-500 text-sm pb-8 select-none">
        © GLYNNE 2025 - Innovación impulsada por inteligencia artificial
      </footer>
    </div>
  );
}
