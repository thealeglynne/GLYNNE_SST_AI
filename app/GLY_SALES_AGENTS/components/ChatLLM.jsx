'use client'

import React, { useEffect, useRef, useState } from 'react'
import MenuLateral from '../components/menuLateral'
import Aalert from '../components/alertSalirChaarla'

const VoiceChatFlame = () => {
  const canvasRef = useRef(null)
  const frequencyData = useRef(new Uint8Array(32))
  const analyserRef = useRef(null)
  const animationIdRef = useRef(null)
  const shouldContinueRef = useRef(true)

  const [conversando, setConversando] = useState(false)
  const [activo, setActivo] = useState(false)
  const [iconVisible, setIconVisible] = useState(true)
  const [menuAbierto, setMenuAbierto] = useState(false)

  // useEffect para la animación del canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      canvas.width = parent.offsetWidth
      canvas.height = parent.offsetHeight
    }

    resizeCanvas()

    const draw = () => {
      const width = canvas.width
      const height = canvas.height
      const numBars = 94
      const spacing = 4
      const totalSpacing = spacing * (numBars - 1)
      const barWidth = (width - totalSpacing) / numBars

      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < numBars; i++) {
        const value = frequencyData.current[i] || 0
        const barHeight = (value / 255) * height
        const x = i * (barWidth + spacing)
        const y = height - barHeight

        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
        gradient.addColorStop(0, 'rgba(255, 240, 200, 0.1)')
        gradient.addColorStop(0.3, 'rgba(255, 120, 39, 0.5)')
        gradient.addColorStop(0.6, 'rgba(255, 159, 94, 0.8)')
        gradient.addColorStop(1, 'rgba(255, 80, 0, 1)')

        ctx.fillStyle = gradient
        ctx.shadowColor = 'rgba(255, 120, 40, 0.6)'
        ctx.shadowBlur = 10
        ctx.fillRect(x, y, barWidth, barHeight)
      }

      animationIdRef.current = requestAnimationFrame(draw)
    }

    draw()
    window.addEventListener('resize', resizeCanvas)

    return () => {
      cancelAnimationFrame(animationIdRef.current)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  const reproducirAudio = (audioBase64) => {
    return new Promise((resolve) => {
      const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: 'audio/mp3' })
      const url = URL.createObjectURL(audioBlob)
      const audio = new Audio(url)
      audio.crossOrigin = 'anonymous'

      audio.onended = () => {
        URL.revokeObjectURL(url)
        resolve()
      }
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        resolve()
      }

      audio.play().catch(() => resolve())
    })
  }

  const iniciarConversacion = async () => {
    if (activo) return;
    setActivo(true);
    setIconVisible(false);
    shouldContinueRef.current = true;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Su navegador no soporta reconocimiento de voz.');
      setActivo(false);
      setIconVisible(true);
      return;
    }

    const reconocimiento = new SpeechRecognition();
    reconocimiento.lang = 'es-CO';
    reconocimiento.interimResults = false;
    reconocimiento.maxAlternatives = 1;

    while (shouldContinueRef.current) {
      setConversando(true);

      try {
        const textoUsuario = await new Promise((resolve, reject) => {
          reconocimiento.start();
          console.log('Iniciando reconocimiento de voz...');
          // Detener el reconocimiento después de 5 segundos para evitar que siga escuchando
          const timeoutId = setTimeout(() => {
            reconocimiento.stop();
            console.log('Reconocimiento detenido por timeout');
          }, 5000);

          reconocimiento.onresult = (event) => {
            const texto = event.results[0][0].transcript.trim();
            console.log('Texto capturado:', texto);
            clearTimeout(timeoutId); // Limpiar el timeout si se obtiene un resultado
            reconocimiento.stop();
            resolve(texto);
          };

          reconocimiento.onerror = (event) => {
            clearTimeout(timeoutId);
            reconocimiento.stop();
            console.error('Error en reconocimiento:', event.error);
            reject(new Error(event.error));
          };

          reconocimiento.onend = () => {
            console.log('Reconocimiento finalizado');
            clearTimeout(timeoutId);
            resolve('');
          };
        });

        if (!textoUsuario || !textoUsuario.trim()) {
          console.warn('Texto vacío, omitiendo solicitud.');
          continue;
        }

        console.log('Enviando texto al servidor:', textoUsuario);
        const res = await fetch('https://gly-tts-back.onrender.com/conversar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texto: textoUsuario }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Error HTTP: ${res.status}`);
        }

        const data = await res.json();
        if (!data.audio_base64) {
          throw new Error(data.error || 'No se recibió audio válido.');
        }

        if (textoUsuario.toLowerCase().includes('salir')) {
          shouldContinueRef.current = false;
          break;
        }

        await reproducirAudio(data.audio_base64);
      } catch (err) {
        console.error('Error durante la conversación:', err.message);
        alert('Hubo un problema en la conversación. Intenta de nuevo.');
        shouldContinueRef.current = false;
        break;
      } finally {
        setConversando(false);
      }
    }

    setActivo(false);
    setIconVisible(true);
  };

  return (
    <div
      className={`w-screen h-screen flex flex-row bg-white text-black transition-all duration-300 ${
        menuAbierto ? 'overflow-auto' : 'overflow-hidden'
      }`}
    >
      {/* Menú lateral */}
      <div className="mt-[32px]">
        <MenuLateral onToggle={(abierto) => setMenuAbierto(abierto)} />
      </div>
      <Aalert />
      {/* Zona principal */}
      <div
        className="flex flex-col flex-1 items-center justify-center"
        onClick={iniciarConversacion}
        title="Haz clic para comenzar a hablar con GLYNNE"
      >
        <div
          className="relative rounded-full px-4 py-3 shadow-lg w-[250px] h-[250px] bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage:
              "url('https://i.pinimg.com/originals/dd/44/f6/dd44f644c063876949b1d96efd6b7442.gif')"
          }}
        >
          <div className="rounded-full overflow-hidden w-[200px] h-[200px] backdrop-blur-md relative">
            <canvas ref={canvasRef} className="w-200 h-full" />

            {/* Icono */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                iconVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
              }`}
            >
              <img src="/logo.png" alt="Logo Glynne" className="w-12 h-12 object-contain" />
            </div>
          </div>
        </div>

        {conversando && (
          <div className="mt-6 text-xs text-gray-500 font-light relative overflow-hidden">
            <span className="relative z-10">charlando…</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-slide" />
          </div>
        )}
      </div>

      {/* Animación */}
      <style jsx>{`
        @keyframes slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-slide {
          animation: slide 1.5s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default VoiceChatFlame