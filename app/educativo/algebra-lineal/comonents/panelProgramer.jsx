'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FaPlay,
  FaCopy,
  FaTrashAlt,
  FaSave,
  FaMagic,
  FaPlus,
  FaTerminal,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function ModernCodeEditor() {
  const [code, setCode] = useState(`# Escribe tu código Python aquí\nprint("Hola desde GLYNNE")`);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lineNumbers, setLineNumbers] = useState([1, 2]);
  const textareaRef = useRef(null);
  const outputRef = useRef(null);

  // Actualizar números de línea
  useEffect(() => {
    const lines = code.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  }, [code]);

  // Auto-scroll para la salida
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const runCode = async () => {
    if (!code.trim()) {
      setOutput('⚠️ Escribe algo de código antes de ejecutar.');
      return;
    }

    setLoading(true);
    setOutput('⌛ Ejecutando código...');
    
    try {
      const res = await fetch('/api/execute-python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      setOutput(data.output || '✅ Ejecución completada (sin salida)');
    } catch (error) {
      setOutput(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setOutput('📋 Código copiado al portapapeles');
  };

  const clearCode = () => {
    setCode('');
    setOutput('');
  };

  const saveCode = () => {
    setOutput('💾 Código guardado (simulado)');
  };

  const formatCode = () => {
    const formatted = code
      .replace(/\s+$/gm, '')
      .replace(/\t/g, '  ')
      .replace(/\n{3,}/g, '\n\n');
    setCode(formatted);
    setOutput('✨ Código formateado');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newCode = code.substring(0, selectionStart) + '  ' + code.substring(selectionEnd);
      setCode(newCode);
      
      setTimeout(() => {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + 2;
      }, 0);
    }
  };

  return (
    <div className="w-full flex justify-center p-2">
      <motion.div 
        className={`w-full ${isExpanded ? 'fixed inset-0 z-50 m-0' : 'max-w-4xl'} h-[${isExpanded ? '100vh' : '500px'}] bg-white border border-gray-200 rounded-lg shadow-lg font-mono overflow-hidden flex flex-col`}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center gap-2 font-medium">
            <motion.div whileHover={{ rotate: 10 }}>
              <FaTerminal className="text-blue-500" />
            </motion.div>
            <span className="text-blue-600">consola-dev.py</span>
          </div>
          <div className="flex gap-2 text-gray-500">
            <motion.button 
              onClick={runCode} 
              disabled={loading} 
              title="Ejecutar" 
              className="p-1 hover:text-green-600 transition-colors"
              whileHover={{ y: -1, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlay />
            </motion.button>
            <motion.button 
              onClick={copyCode} 
              title="Copiar" 
              className="p-1 hover:text-blue-600 transition-colors"
              whileHover={{ y: -1, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCopy />
            </motion.button>
            <motion.button 
              onClick={clearCode} 
              title="Limpiar" 
              className="p-1 hover:text-red-600 transition-colors"
              whileHover={{ y: -1, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaTrashAlt />
            </motion.button>
            <motion.button 
              onClick={saveCode} 
              title="Guardar" 
              className="p-1 hover:text-purple-600 transition-colors"
              whileHover={{ y: -1, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSave />
            </motion.button>
            <motion.button 
              onClick={formatCode} 
              title="Formatear" 
              className="p-1 hover:text-yellow-600 transition-colors"
              whileHover={{ y: -1, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaMagic />
            </motion.button>
            <motion.button 
              onClick={() => setIsExpanded(!isExpanded)} 
              title={isExpanded ? "Minimizar" : "Maximizar"} 
              className="p-1 hover:text-gray-800 transition-colors"
              whileHover={{ y: -1, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isExpanded ? <FaCompress /> : <FaExpand />}
            </motion.button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 relative bg-white overflow-auto flex">
          {/* Números de línea */}
          <div className="sticky left-0 top-0 h-full bg-gray-50 text-gray-400 text-right pr-2 py-3 text-xs select-none z-10">
            {lineNumbers.map(num => (
              <div key={num} className="leading-5">{num}</div>
            ))}
          </div>
          
          {/* Editor de texto */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="relative z-10 w-full h-full min-h-[150px] bg-transparent text-gray-800 font-mono focus:outline-none resize-none whitespace-pre-wrap px-3 py-3 leading-5 text-sm"
              style={{
                fontFamily: `'Fira Code', 'JetBrains Mono', monospace`,
                tabSize: 2,
              }}
              spellCheck="false"
            />
          </div>
        </div>

        {/* Consola de salida */}
        <motion.div 
          ref={outputRef}
          className="bg-gray-50 border-t border-gray-200 text-gray-700 p-3 text-xs overflow-auto font-mono leading-relaxed whitespace-pre-wrap h-[120px]"
          initial={{ height: 0 }}
          animate={{ height: output ? 120 : 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="flex items-center mb-1 text-blue-600 gap-1 text-xs font-medium">
            <FaTerminal /> SALIDA
          </div>
          <AnimatePresence>
            {output && (
              <motion.div 
                className="text-gray-700"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {output}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}