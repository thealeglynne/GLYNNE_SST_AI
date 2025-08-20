'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Chat from '../../GLY_SALES_AGENTS/components/auditoria';
import Combersacion from '../../chat/components/sst';
import {
  faFileUpload,
  faRocket,
  faSpinner,
  faTimesCircle,
  faFileAlt,
  faChartBar,
  faTable,
  faFileCsv,
  faFileExcel,
  faFile,
  faInfoCircle,
  faQuestionCircle,
  faDatabase,
} from '@fortawesome/free-solid-svg-icons';

export default function AnalizadorDatos() {
  const [descripcion, setDescripcion] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('informe');
  const [data, setData] = useState(null);

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const formatText = (text) => {
    if (!text) return '';
    return text
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !descripcion) {
      setError('Por favor ingresa una descripción y selecciona un archivo.');
      return;
    }
    setError(null);
    setLoading(true);
    setResultado(null);
    setActiveSection('informe');

    try {
      const formData = new FormData();
      formData.append('descripcion', descripcion);
      formData.append('file', file);

      const res = await fetch('https://gly-csv-service-3.onrender.com/analizar', {
        method: 'POST',   
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setResultado(data);
      setData(data.contenido);
      setActiveSection('informe');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const renderPerfilDatos = (perfil) => {
    if (!perfil)
      return (
        <div className="text-gray-500 italic text-sm">
          No hay datos de perfil disponibles. Sube un archivo y realiza un análisis para ver esta información.
        </div>
      );

    return (
      <div className="text-sm">
        <h3 className="text-base font-medium mb-3 text-gray-800 flex items-center">
          <span className="w-4 h-4 mr-2 flex items-center justify-center">
            <FontAwesomeIcon icon={faDatabase} className="text-gray-500" width="12" height="12" />
          </span>
          Resumen General
        </h3>
        <div className="mb-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-gray-100 p-2 rounded">
              <dt className="font-medium text-gray-700">Filas</dt>
              <dd className="text-gray-800">{perfil.shape[0]}</dd>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <dt className="font-medium text-gray-700">Columnas</dt>
              <dd className="text-gray-800">{perfil.shape[1]}</dd>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <dt className="font-medium text-gray-700">Registros duplicados</dt>
              <dd className="text-gray-800">{perfil.duplicates}</dd>
            </div>
          </dl>
        </div>

        <h3 className="text-base font-medium mb-3 text-gray-800 flex items-center">
          <span className="w-4 h-4 mr-2 flex items-center justify-center">
            <FontAwesomeIcon icon={faInfoCircle} className="text-gray-500" width="12" height="12" />
          </span>
          Tipos de Datos
        </h3>
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse text-gray-800">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border border-gray-200 text-left text-xs sm:text-sm">Columna</th>
                <th className="p-2 border border-gray-200 text-left text-xs sm:text-sm">Tipo de Dato</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(perfil.dtypes || {}).map(([columna, tipo], index) => (
                <tr key={columna} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-2 border border-gray-200 text-xs sm:text-sm">{columna}</td>
                  <td className="p-2 border border-gray-200 text-xs sm:text-sm">{tipo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-medium mb-3 text-gray-800 flex items-center">
          <span className="w-4 h-4 mr-2 flex items-center justify-center">
            <FontAwesomeIcon icon={faQuestionCircle} className="text-gray-500" width="12" height="12" />
          </span>
          Valores Faltantes
        </h3>
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse text-gray-800">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border border-gray-200 text-left text-xs sm:text-sm">Columna</th>
                <th className="p-2 border border-gray-200 text-left text-xs sm:text-sm">Valores faltantes</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(perfil.missing || {}).map(([columna, faltantes], index) => (
                <tr key={columna} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-2 border border-gray-200 text-xs sm:text-sm">{columna}</td>
                  <td className="p-2 border border-gray-200 text-xs sm:text-sm">{faltantes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {perfil.categorical_tops && (
          <>
            <h3 className="text-base font-medium mb-3 text-gray-800 flex items-center">
              <span className="w-4 h-4 mr-2 flex items-center justify-center">
                <FontAwesomeIcon icon={faChartBar} className="text-gray-500" width="12" height="12" />
              </span>
              Valores Categóricos (Top 5)
            </h3>
            {Object.entries(perfil.categorical_tops || {}).map(([columna, valores]) => (
              <div key={columna} className="mb-4">
                <h4 className="text-sm font-medium mb-1 text-gray-700">{columna}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-gray-800">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border border-gray-200 text-left text-xs sm:text-sm">Valor</th>
                        <th className="p-2 border border-gray-200 text-left text-xs sm:text-sm">Conteo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(valores).map(([valor, conteo], index) => (
                        <tr key={valor} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-2 border border-gray-200 text-xs sm:text-sm">{valor}</td>
                          <td className="p-2 border border-gray-200 text-xs sm:text-sm">{conteo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full min-h-screen bg-white">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left Section */}
        <div className="w-full md:w-1/2 lg:w-1/3 p-4 sm:p-6 bg-white overflow-y-auto">
          <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
            <motion.img
              src="/logo2.png"
              alt="Logo"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-12 sm:w-16 h-12 sm:h-16"
            />
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-lg sm:text-xl md:text-2xl font-bold text-black"
            >
              Analiza más a fondo tus datos y tu negocio con IA
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-sm sm:text-base text-gray-800 max-w-md"
            >
              Sube tus bases de datos y nuestro sistema de inteligencia artificial los procesará
              para ofrecerte un análisis rápido, preciso y fácil de entender.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="w-full max-w-md"
            >
              <form onSubmit={handleSubmit} className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <textarea
                  placeholder="Descripción de la base de datos..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full h-24 sm:h-32 mb-4 sm:mb-6 p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm sm:text-base"
                />
                <div className="mb-4 sm:mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    <span className="w-4 h-4 mr-2 inline-flex items-center justify-center">
                      <FontAwesomeIcon icon={faFileUpload} width="12" height="12" />
                    </span>
                    Selecciona tu archivo (CSV, Excel, JSON)
                  </label>
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls, .json"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="block w-full text-xs sm:text-sm text-gray-500
                      file:mr-4 file:py-2 sm:file:py-3 file:px-3 sm:file:px-4
                      file:rounded-lg file:border-0
                      file:text-xs sm:file:text-sm file:font-semibold
                      file:bg-gray-100 file:text-gray-700
                      hover:file:bg-gray-200"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium text-white transition-colors
                    ${loading ? 'bg-gray-600' : 'bg-gray-800 hover:bg-gray-900'}
                    flex items-center justify-center gap-2 text-sm sm:text-base`}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 flex items-center justify-center">
                        <FontAwesomeIcon icon={faSpinner} spin width="14" height="14" />
                      </span>
                      Analizando...
                    </>
                  ) : (
                    <>
                      <span className="w-4 h-4 flex items-center justify-center">
                        <FontAwesomeIcon icon={faRocket} width="14" height="14" />
                      </span>
                      Enviar para análisis
                    </>
                  )}
                </button>
              </form>
            </motion.div>
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-md p-3 sm:p-4 bg-gray-100 text-gray-800 rounded-lg border border-gray-300 flex items-center text-sm"
                >
                  <span className="w-4 h-4 mr-2 flex items-center justify-center">
                    <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" width="14" height="14" />
                  </span>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="w-full">
              <Chat />
              <div className="my-4" />
              <Combersacion />
            </div>
          </div>
        </div>
        {/* Right Section */}
        <div className="w-full md:w-1/2 lg:w-2/3 p-4 sm:p-6 bg-gray-50 overflow-y-auto">
          <div className="w-full text-left space-y-4 sm:space-y-6">
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              <button
                onClick={() => toggleSection('informe')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex items-center ${
                  activeSection === 'informe'
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-xs'
                }`}
              >
                <span className="w-4 h-4 mr-2 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faFileAlt}
                    className={activeSection === 'informe' ? 'text-white' : 'text-gray-700'}
                    width="12"
                    height="12"
                  />
                </span>
                Informe Analítico
              </button>
              <button
                onClick={() => toggleSection('perfil')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex items-center ${
                  activeSection === 'perfil'
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-xs'
                }`}
              >
                <span className="w-4 h-4 mr-2 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faChartBar}
                    className={activeSection === 'perfil' ? 'text-white' : 'text-gray-700'}
                    width="12"
                    height="12"
                  />
                </span>
                Perfil de Datos
              </button>
              <button
                onClick={() => toggleSection('vista-previa')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex items-center ${
                  activeSection === 'vista-previa'
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-xs'
                }`}
              >
                <span className="w-4 h-4 mr-2 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faTable}
                    className={activeSection === 'vista-previa' ? 'text-white' : 'text-gray-700'}
                    width="12"
                    height="12"
                  />
                </span>
                Vista Previa
              </button>
            </div>
            <motion.div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-base sm:text-lg font-medium mb-4 text-gray-800 flex items-center">
                <span className="w-4 h-4 mr-2 flex items-center justify-center">
                  <FontAwesomeIcon icon={faFileAlt} className="text-gray-500" width="12" height="12" />
                </span>
                <span className="text-gray-700">Informe Analítico</span>
              </h2>
              {activeSection === 'informe' && (
                <div className="bg-gray-50 p-3 sm:p-4 rounded border border-gray-100">
                  {resultado?.informe ? (
                    <div
                      className="prose prose-sm max-w-none text-gray-700 text-sm sm:text-base"
                      dangerouslySetInnerHTML={{ __html: formatText(resultado.informe) }}
                    />
                  ) : (
                    <div className="text-gray-900 italic text-sm">
                      No hay informe disponible. Sube un archivo y realiza un análisis para generar el informe.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
            <motion.div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-base sm:text-lg font-medium mb-4 text-gray-800 flex items-center">
                <span className="w-4 h-4 mr-2 flex items-center justify-center">
                  <FontAwesomeIcon icon={faChartBar} className="text-gray-500" width="12" height="12" />
                </span>
                <span className="text-gray-700">Perfil de Datos</span>
              </h2>
              {activeSection === 'perfil' && renderPerfilDatos(resultado?.perfil)}
            </motion.div>
            <motion.div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-base sm:text-lg font-medium mb-4 text-gray-800 flex items-center">
                <span className="w-4 h-4 mr-2 flex items-center justify-center">
                  <FontAwesomeIcon icon={faTable} className="text-gray-500" width="12" height="12" />
                </span>
                <span className="text-gray-700">Vista Previa de Datos</span>
              </h2>
              {activeSection === 'vista-previa' && (
                <div className="overflow-x-auto">
                  <pre className="whitespace-pre-wrap bg-gray-50 p-3 sm:p-4 rounded border border-gray-100 text-xs font-mono text-gray-600 leading-snug">
                    {resultado?.contenido ? (
                      JSON.stringify(resultado.contenido, null, 2)
                    ) : (
                      <div className="text-gray-400 italic">
                        No hay datos de vista previa disponibles. Sube un archivo y realiza un análisis para ver esta información.
                      </div>
                    )}
                  </pre>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}