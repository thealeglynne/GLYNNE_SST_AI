import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import ReactMarkdown from "react-markdown";

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AnalisisDashboard = ({ data }) => {
  if (!data) return <p className="text-gray-500">No hay datos para mostrar.</p>;

  const { perfil, contenido, informe, fecha, metadata } = data;

  // ====== Datos para gráficas numéricas ======
  const numericCharts = Object.entries(contenido.distribuciones_numericas || {}).map(([col, stats]) => {
    const labels = ["Min", "Max", "Media", "Mediana", "Desviación"];
    const values = [stats.min, stats.max, stats.media, stats.mediana, stats.desviacion];
    return {
      col,
      chartData: {
        labels,
        datasets: [
          {
            label: col,
            data: values,
            backgroundColor: "rgba(59,130,246,0.6)"
          }
        ]
      }
    };
  });

  // ====== Datos para gráficas categóricas ======
  const categoricalCharts = Object.entries(contenido.distribuciones_categoricas || {}).map(([col, dist]) => {
    const labels = Object.keys(dist);
    const values = Object.values(dist);
    return {
      col,
      chartData: {
        labels,
        datasets: [
          {
            label: col,
            data: values,
            backgroundColor: "rgba(16,185,129,0.6)"
          }
        ]
      }
    };
  });

  return (
    <div className="space-y-8 p-6">
      {/* METADATOS */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">📄 Metadatos</h2>
        <ul className="text-sm text-gray-700">
          <li><strong>Fecha análisis:</strong> {new Date(fecha).toLocaleString()}</li>
          <li><strong>Tiempo de procesamiento:</strong> {metadata?.processing_time_seconds.toFixed(2)}s</li>
          <li><strong>Tamaño archivo:</strong> {metadata?.file_size_bytes} bytes</li>
          <li><strong>Tipo archivo:</strong> {metadata?.file_type}</li>
        </ul>
      </div>

      {/* PERFIL DE LA MATRIZ */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">📊 Perfil de la matriz</h2>
        <table className="w-full border-collapse">
          <tbody>
            <tr className="bg-gray-50">
              <td className="p-2 border">Filas</td>
              <td className="p-2 border">{perfil.shape[0]}</td>
            </tr>
            <tr>
              <td className="p-2 border">Columnas</td>
              <td className="p-2 border">{perfil.shape[1]}</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="p-2 border">Duplicados</td>
              <td className="p-2 border">{perfil.duplicates}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* GRÁFICAS NUMÉRICAS */}
      {numericCharts.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">📈 Distribuciones Numéricas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {numericCharts.map(({ col, chartData }) => (
              <div key={col} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium mb-2">{col}</h3>
                <Bar data={chartData} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GRÁFICAS CATEGÓRICAS */}
      {categoricalCharts.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">🏷 Distribuciones Categóricas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoricalCharts.map(({ col, chartData }) => (
              <div key={col} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium mb-2">{col}</h3>
                <Bar data={chartData} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MUESTRA DE DATOS */}
      <div className="bg-white shadow rounded-lg p-4 overflow-auto">
        <h2 className="text-lg font-semibold mb-4">📋 Muestra de Datos</h2>
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              {Object.keys(contenido.muestra[0] || {}).map((col) => (
                <th key={col} className="border px-2 py-1">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contenido.muestra.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-100">
                {Object.values(row).map((val, i) => (
                  <td key={i} className="border px-2 py-1">{val?.toString()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* INFORME DEL LLM */}
      <div className="bg-white shadow rounded-lg p-4 prose max-w-none">
        <h2 className="text-lg font-semibold mb-4">🧠 Informe Estratégico</h2>
        <ReactMarkdown>{informe}</ReactMarkdown>
      </div>
    </div>
  );
};

export default AnalisisDashboard;
