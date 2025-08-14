'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileUpload, 
  faRocket, 
  faSpinner, 
  faTimesCircle,
  faFileAlt,
  faChartBar,
  faTable,
  faChartPie,
  faInfoCircle,
  faChartLine,
  faQuestionCircle,
  faDatabase,
  faChartArea
} from '@fortawesome/free-solid-svg-icons';
import { Chart } from 'chart.js/auto';
import { BoxPlotController, BoxAndWiskers } from '@sgratzl/chartjs-chart-boxplot';

// Registrar el controlador de boxplot
Chart.register(BoxPlotController, BoxAndWiskers);

export default function AnalizadorDatos() {
  const [descripcion, setDescripcion] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  
  const chartRefs = {
    numeric: useRef(null),
    categorical: useRef(null),
    outliers: useRef(null)
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  useEffect(() => {
    // Limpiar gráficos cuando el componente se desmonta
    return () => {
      Object.values(chartRefs).forEach(ref => {
        if (ref.current && ref.current.chart) {
          ref.current.chart.destroy();
        }
      });
    };
  }, []);

  useEffect(() => {
    if (resultado && activeSection === 'metricas') {
      renderCharts();
    }
  }, [resultado, activeSection]);

  const renderCharts = () => {
    if (!resultado?.perfil) return;

    const { numeric_summary, categorical_tops } = resultado.perfil;

    // Gráfico para métricas numéricas
    if (numeric_summary && chartRefs.numeric.current) {
      const numericData = Object.entries(numeric_summary).map(([columna, stats]) => ({
        columna,
        ...stats
      }));

      const labels = numericData.map(item => item.columna);
      const datasets = [
        {
          label: 'Media',
          data: numericData.map(item => item.mean),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Mediana',
          data: numericData.map(item => item['50%']),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Desviación Estándar',
          data: numericData.map(item => item.std),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ];

      if (chartRefs.numeric.current.chart) {
        chartRefs.numeric.current.chart.destroy();
      }

      chartRefs.numeric.current.chart = new Chart(chartRefs.numeric.current, {
        type: 'bar',
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Métricas Numéricas por Columna'
            },
          },
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });
    }

    // Gráfico para valores categóricos (top 5)
    if (categorical_tops && chartRefs.categorical.current) {
      const categoricalData = Object.entries(categorical_tops).map(([columna, valores]) => ({
        columna,
        valores: Object.entries(valores).map(([valor, conteo]) => ({ valor, conteo }))
      }));

      // Tomamos la primera columna categórica para el ejemplo
      if (categoricalData.length > 0) {
        const firstCategory = categoricalData[0];
        const labels = firstCategory.valores.map(item => item.valor);
        const data = firstCategory.valores.map(item => item.conteo);

        if (chartRefs.categorical.current.chart) {
          chartRefs.categorical.current.chart.destroy();
        }

        chartRefs.categorical.current.chart = new Chart(chartRefs.categorical.current, {
          type: 'pie',
          data: {
            labels,
            datasets: [{
              data,
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: `Distribución Categórica - ${firstCategory.columna} (Top 5)`
              },
            }
          }
        });
      }
    }

    // Gráfico para outliers (usando boxplot)
    if (numeric_summary && chartRefs.outliers.current) {
      const numericData = Object.entries(numeric_summary).map(([columna, stats]) => ({
        columna,
        ...stats
      }));

      const labels = numericData.map(item => item.columna);
      const datasets = numericData.map(item => [
        item.min,
        item['25%'],
        item['50%'],
        item['75%'],
        item.max
      ]);

      if (chartRefs.outliers.current.chart) {
        chartRefs.outliers.current.chart.destroy();
      }

      chartRefs.outliers.current.chart = new Chart(chartRefs.outliers.current, {
        type: 'boxplot',
        data: {
          labels,
          datasets: [{
            data: datasets,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            outlierBackgroundColor: 'rgba(255, 99, 132, 1)',
            outlierRadius: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Distribución y Outliers (Boxplot)'
            },
          },
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });
    }
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
    setActiveSection(null);

    try {
      const formData = new FormData();
      formData.append('descripcion', descripcion);
      formData.append('file', file);

      const res = await fetch('http://localhost:8000/analizar', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setResultado(data);
      setActiveSection('informe');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const renderPerfilDatos = (perfil) => {
    if (!perfil) return null;

    return (
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          <FontAwesomeIcon icon={faDatabase} className="mr-2" />
          Resumen General
        </h3>
        <table className="w-full border-collapse mb-8">
          <tbody>
            <tr className="bg-gray-100">
              <td className="p-3 border border-gray-300 font-medium">Filas</td>
              <td className="p-3 border border-gray-300">{perfil.shape[0]}</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-300 font-medium">Columnas</td>
              <td className="p-3 border border-gray-300">{perfil.shape[1]}</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="p-3 border border-gray-300 font-medium">Registros duplicados</td>
              <td className="p-3 border border-gray-300">{perfil.duplicates}</td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
          Tipos de Datos
        </h3>
        <table className="w-full border-collapse mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border border-gray-300">Columna</th>
              <th className="p-3 border border-gray-300">Tipo de Dato</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(perfil.dtypes || {}).map(([columna, tipo], index) => (
              <tr key={columna} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-3 border border-gray-300">{columna}</td>
                <td className="p-3 border border-gray-300">{tipo}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          <FontAwesomeIcon icon={faQuestionCircle} className="mr-2" />
          Valores Faltantes
        </h3>
        <table className="w-full border-collapse mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border border-gray-300">Columna</th>
              <th className="p-3 border border-gray-300">Valores faltantes</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(perfil.missing || {}).map(([columna, faltantes], index) => (
              <tr key={columna} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-3 border border-gray-300">{columna}</td>
                <td className="p-3 border border-gray-300">{faltantes}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {perfil.numeric_summary && (
          <>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              <FontAwesomeIcon icon={faChartLine} className="mr-2" />
              Resumen Numérico
            </h3>
            <table className="w-full border-collapse mb-8">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border border-gray-300">Columna</th>
                  <th className="p-3 border border-gray-300">Mínimo</th>
                  <th className="p-3 border border-gray-300">Máximo</th>
                  <th className="p-3 border border-gray-300">Media</th>
                  <th className="p-3 border border-gray-300">Mediana</th>
                  <th className="p-3 border border-gray-300">Desviación</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(perfil.numeric_summary || {}).map(([columna, stats], index) => (
                  <tr key={columna} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 border border-gray-300">{columna}</td>
                    <td className="p-3 border border-gray-300">{stats.min?.toFixed(2)}</td>
                    <td className="p-3 border border-gray-300">{stats.max?.toFixed(2)}</td>
                    <td className="p-3 border border-gray-300">{stats.mean?.toFixed(2)}</td>
                    <td className="p-3 border border-gray-300">{stats['50%']?.toFixed(2)}</td>
                    <td className="p-3 border border-gray-300">{stats.std?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {perfil.categorical_tops && (
          <>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              <FontAwesomeIcon icon={faChartBar} className="mr-2" />
              Valores Categóricos (Top 5)
            </h3>
            {Object.entries(perfil.categorical_tops || {}).map(([columna, valores]) => (
              <div key={columna} className="mb-6">
                <h4 className="text-md font-medium mb-2 text-gray-700">{columna}</h4>
                <table className="w-full border-collapse mb-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 border border-gray-300">Valor</th>
                      <th className="p-3 border border-gray-300">Conteo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(valores).map(([valor, conteo], index) => (
                      <tr key={valor} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 border border-gray-300">{valor}</td>
                        <td className="p-3 border border-gray-300">{conteo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-10 py-16 bg-white">
      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center text-center space-y-10 bg-white p-6 sm:p-12 ring-1 ring-black/10 shadow-lg rounded-lg">

        {/* Logo */}
        <motion.img
          src="/logo2.png"
          alt="Logo"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 mb-2"
        />

        {/* Título */}
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-lg sm:text-xl md:text-2xl font-bold text-black"
        >
          Analizador de Datos con IA
        </motion.h2>

        {/* Texto explicativo */}
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-sm sm:text-base text-gray-600 max-w-md mt-1"
        >
          Sube tus datos y nuestro sistema de inteligencia artificial los procesará 
          para ofrecerte un análisis rápido, preciso y fácil de entender.
        </motion.p>

        {/* Formulario */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full max-w-3xl"
        >
          <form onSubmit={handleSubmit} className="mb-10 p-6 sm:p-8 bg-white rounded-lg shadow-md border border-gray-200">
            <textarea
              placeholder="Descripción de la base de datos..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full h-32 mb-6 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
            
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                <FontAwesomeIcon icon={faFileUpload} className="mr-2" />
                Selecciona tu archivo (CSV, Excel, JSON)
              </label>
              <input
                type="file"
                accept=".csv, .xlsx, .xls, .json"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-3 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gray-100 file:text-gray-700
                  hover:file:bg-gray-200"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors
                ${loading ? 'bg-gray-600' : 'bg-gray-800 hover:bg-gray-900'}
                flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  Analizando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faRocket} className="mr-2" />
                  Enviar para análisis
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Mensaje de error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-3xl p-4 bg-gray-100 text-gray-800 rounded-lg border border-gray-300 flex items-center"
            >
              <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red-500" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resultados */}
        <AnimatePresence>
          {resultado && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full text-left space-y-4"
            >
              {/* Botones de navegación entre secciones */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => toggleSection('informe')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeSection === 'informe' 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                  Informe Analítico
                </button>
                
                <button
                  onClick={() => toggleSection('perfil')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeSection === 'perfil' 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <FontAwesomeIcon icon={faChartBar} className="mr-2" />
                  Perfil de Datos
                </button>
                
                <button
                  onClick={() => toggleSection('metricas')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeSection === 'metricas' 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <FontAwesomeIcon icon={faChartArea} className="mr-2" />
                  Visualización
                </button>
                
                {resultado.contenido && (
                  <button
                    onClick={() => toggleSection('vista-previa')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeSection === 'vista-previa' 
                        ? 'bg-gray-800 text-white' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <FontAwesomeIcon icon={faTable} className="mr-2" />
                    Vista Previa
                  </button>
                )}
              </div>

              {/* Sección de Informe Analítico */}
              <AnimatePresence>
                {activeSection === 'informe' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200 overflow-hidden"
                  >
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
                      <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                      Informe Analítico
                    </h2>
                    <div
                      className="whitespace-pre-wrap bg-gray-50 p-5 rounded-lg border border-gray-200"
                      dangerouslySetInnerHTML={{ __html: resultado.informe.replace(/\n/g, '<br />') }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sección de Perfil de Datos */}
              <AnimatePresence>
                {activeSection === 'perfil' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200 overflow-hidden"
                  >
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
                      <FontAwesomeIcon icon={faChartBar} className="mr-2" />
                      Perfil de Datos
                    </h2>
                    {renderPerfilDatos(resultado.perfil)}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sección de Visualización de Métricas */}
              <AnimatePresence>
                {activeSection === 'metricas' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200 overflow-hidden"
                  >
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
                      <FontAwesomeIcon icon={faChartArea} className="mr-2" />
                      Visualización de Métricas
                    </h2>
                    
                    <div className="space-y-8">
                      {/* Gráfico de métricas numéricas */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                          <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                          Métricas Numéricas
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <canvas ref={chartRefs.numeric} height="400"></canvas>
                        </div>
                      </div>

                      {/* Gráfico de distribución categórica */}
                      {resultado.perfil.categorical_tops && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            <FontAwesomeIcon icon={faChartPie} className="mr-2" />
                            Distribución Categórica
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <canvas ref={chartRefs.categorical} height="400"></canvas>
                          </div>
                        </div>
                      )}

                      {/* Gráfico de outliers */}
                      {resultado.perfil.numeric_summary && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            <FontAwesomeIcon icon={faChartBar} className="mr-2" />
                            Distribución y Outliers
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <canvas ref={chartRefs.outliers} height="400"></canvas>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sección de Vista Previa */}
              <AnimatePresence>
                {activeSection === 'vista-previa' && resultado.contenido && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200 overflow-hidden"
                  >
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
                      <FontAwesomeIcon icon={faTable} className="mr-2" />
                      Vista Previa de Datos
                    </h2>
                    <div className="overflow-x-auto">
                      <pre className="whitespace-pre-wrap bg-gray-50 p-5 rounded-lg border border-gray-200 text-sm">
                        {JSON.stringify(resultado.contenido, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}