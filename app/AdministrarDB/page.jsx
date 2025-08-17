"use client";
import { useState, useEffect } from "react";

export default function DatabaseManager() {
  const [tableName, setTableName] = useState("");
  const [columns, setColumns] = useState([
    { name: "id", type: "uuid", isPrimary: true },
  ]);
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [newRow, setNewRow] = useState({});
  const [selectedTable, setSelectedTable] = useState("");

  // 👉 Agregar columna
  const handleAddColumn = () => {
    setColumns([...columns, { name: "", type: "text", isPrimary: false }]);
  };

  // 👉 Editar definición de columna
  const handleColumnChange = (index, field, value) => {
    const updated = [...columns];
    updated[index][field] = value;
    setColumns(updated);
  };

  // 👉 Validar nombre de tabla y columnas
  const validateInputs = () => {
    if (!tableName || !/^[a-zA-Z0-9_]+$/.test(tableName)) {
      setMessage("❌ El nombre de la tabla debe contener solo letras, números o guiones bajos");
      return false;
    }
    for (const col of columns) {
      if (!col.name || !/^[a-zA-Z0-9_]+$/.test(col.name)) {
        setMessage("❌ Los nombres de las columnas deben contener solo letras, números o guiones bajos");
        return false;
      }
    }
    return true;
  };

  // 👉 Crear tabla
  const handleCreateTable = async () => {
    if (!validateInputs()) return;

    try {
      const res = await fetch("/api/createTable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableName, columns }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`❌ Error: ${data.error}`);
      } else {
        setMessage(`✅ Tabla creada con éxito: ${tableName}`);
        setSelectedTable(tableName);
        setNewRow({}); // Reset form
      }
    } catch (e) {
      setMessage(`❌ Error: ${e.message}`);
    }
  };

  // 👉 Obtener registros
  const fetchRows = async () => {
    if (!selectedTable) return;
    try {
      const res = await fetch(`/api/crud?table=${selectedTable}`);
      const data = await res.json();
      if (data.error) {
        setMessage(`❌ Error: ${data.error}`);
      } else {
        setRows(data.rows || []);
        setMessage(data.rows.length === 0 ? `ℹ️ La tabla ${selectedTable} está vacía` : "");
      }
    } catch (e) {
      setMessage(`❌ Error: ${e.message}`);
    }
  };

  // 👉 Insertar registro
  const handleInsertRow = async () => {
    if (!selectedTable) {
      setMessage("❌ Selecciona una tabla primero");
      return;
    }

    // Validate that all primary key columns have values
    const primaryKeyCols = columns.filter((col) => col.isPrimary).map((col) => col.name);
    for (const col of primaryKeyCols) {
      if (!newRow[col] && col !== "id") { // Allow id to be optional if auto-generated
        setMessage(`❌ Debes proporcionar un valor para la columna ${col}`);
        return;
      }
    }

    try {
      const res = await fetch(`/api/crud?table=${selectedTable}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRow),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`❌ Error: ${data.error}`);
      } else {
        setMessage("✅ Registro insertado");
        setNewRow({}); // Clear form
        fetchRows();
      }
    } catch (e) {
      setMessage(`❌ Error: ${e.message}`);
    }
  };

  // 👉 Eliminar registro
  const handleDelete = async (row) => {
    if (!selectedTable) return;

    // Construct query parameters for composite primary key
    const primaryKeyCols = columns.filter((col) => col.isPrimary).map((col) => col.name);
    const queryParams = primaryKeyCols
      .map((col) => `${col}=${encodeURIComponent(row[col])}`)
      .join("&");

    try {
      const res = await fetch(`/api/crud?table=${selectedTable}&${queryParams}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`❌ Error: ${data.error}`);
      } else {
        setMessage("🗑️ Registro eliminado");
        fetchRows();
      }
    } catch (e) {
      setMessage(`❌ Error: ${e.message}`);
    }
  };

  // 👉 Auto refrescar registros cuando cambias de tabla
  useEffect(() => {
    if (selectedTable) fetchRows();
  }, [selectedTable]);

  return (
    <div className="p-4 space-y-6 bg-gray-100 rounded-lg shadow">
      <h2 className="text-xl font-bold">Gestión de Base de Datos</h2>

      {/* Crear tabla */}
      <div className="space-y-3">
        <h3 className="font-semibold">Crear nueva tabla</h3>
        <input
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="Nombre de la tabla (ej. dddd)"
          className="p-2 border rounded w-full"
        />
        {columns.map((col, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              value={col.name}
              onChange={(e) => handleColumnChange(i, "name", e.target.value)}
              placeholder="Nombre columna (ej. glyne)"
              className="p-2 border rounded flex-1"
            />
            <select
              value={col.type}
              onChange={(e) => handleColumnChange(i, "type", e.target.value)}
              className="p-2 border rounded"
            >
              <option value="text">text</option>
              <option value="uuid">uuid</option>
              <option value="int">int</option>
              <option value="boolean">boolean</option>
              <option value="timestamp">timestamp</option>
            </select>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={col.isPrimary}
                onChange={(e) => handleColumnChange(i, "isPrimary", e.target.checked)}
              />
              PK
            </label>
          </div>
        ))}
        <button
          onClick={handleAddColumn}
          className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          ➕ Agregar columna
        </button>
        <button
          onClick={handleCreateTable}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Crear Tabla
        </button>
      </div>

      {/* Seleccionar tabla */}
      {selectedTable && (
        <div className="space-y-3">
          <h3 className="font-semibold">Tabla seleccionada: {selectedTable}</h3>
          <button
            onClick={() => {
              setSelectedTable("");
              setRows([]);
              setNewRow({});
              setMessage("");
            }}
            className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Cambiar tabla
          </button>
        </div>
      )}

      {/* Insertar datos */}
      {selectedTable && (
        <div className="space-y-3">
          <h3 className="font-semibold">Insertar en {selectedTable}</h3>
          {columns.map((col, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder={col.name}
                value={newRow[col.name] || ""}
                onChange={(e) =>
                  setNewRow({ ...newRow, [col.name]: e.target.value })
                }
                className="p-2 border rounded w-full"
                disabled={col.name === "id" && col.type === "uuid"} // Optional: Disable id if auto-generated
              />
              {col.name === "id" && col.type === "uuid" && (
                <span className="text-xs text-gray-500">
                  (Auto-generado si se deja en blanco)
                </span>
              )}
            </div>
          ))}
          <button
            onClick={handleInsertRow}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Insertar Registro
          </button>
        </div>
      )}

      {/* Listado de registros */}
      {rows.length > 0 && (
        <div>
          <h3 className="font-semibold">Registros en {selectedTable}</h3>
          <table className="w-full border border-collapse">
            <thead>
              <tr>
                {Object.keys(rows[0]).map((col) => (
                  <th key={col} className="border px-2 py-1 bg-gray-200">
                    {col}
                  </th>
                ))}
                <th className="border px-2 py-1 bg-gray-200">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="border px-2 py-1">
                      {val}
                    </td>
                  ))}
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => handleDelete(row)}
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}