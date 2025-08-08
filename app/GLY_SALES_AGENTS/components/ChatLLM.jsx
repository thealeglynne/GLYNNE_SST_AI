'use client'

import React, { useEffect, useRef, useState } from 'react'
import { FaRobot } from 'react-icons/fa'
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
  const conversacionTimerRef = useRef(null);
  
  // 🔹 Interceptar cierre, recarga o retroceso
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (activo) {
        e.preventDefault()
        e.returnValue = 'Hay un proceso en ejecución. ¿Seguro que quieres salir?'
        return e.returnValue
      }
    }

    const handlePopState = () => {
      if (activo) {
        const confirmar = confirm('Hay un proceso en ejecución. ¿Seguro que quieres salir?')
        if (!confirmar) {
          window.history.pushState(null, '', window.location.href) // Revertir retroceso
        } else {
          shouldContinueRef.current = false // Detener procesos
          fetch('http://localhost:8000/desactivar', { method: 'POST' }).catch(() => {})
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    // Truco para bloquear retroceso inicial
    window.history.pushState(null, '', window.location.href)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)

      // 🔹 Desactivar backend automáticamente al desmontar componente
      if (activo) {
        shouldContinueRef.current = false
        fetch('http://localhost:8000/desactivar', { method: 'POST' }).catch(() => {})
      }
    }
  }, [activo])

  // Animación visual
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

  const iniciarConversacion = async () => {
    if (activo) return
    setActivo(true)
    setIconVisible(false)
    shouldContinueRef.current = true

    while (shouldContinueRef.current) {
      setConversando(true)

      try {
        const res = await fetch('http://localhost:8000/conversar', { method: 'POST' })
        const data = await res.json()

        if (!res.ok || !data.audio_base64) throw new Error(data.error || 'Error desconocido.')

        if (data.transcripcion_usuario?.toLowerCase().includes('salir')) {
          shouldContinueRef.current = false
          break
        }

        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audio_base64), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        )

        const url = URL.createObjectURL(audioBlob)
        await reproducirAudio(url)
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error('Error al conversar:', err.message)
        shouldContinueRef.current = false
        break
      } finally {
        setConversando(false)
      }
    }

    setActivo(false)
    setIconVisible(true)
  }

  const reproducirAudio = (url) => {
    return new Promise((resolve) => {
      const audio = new Audio(url)
      audio.crossOrigin = 'anonymous'

      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioContext.createMediaElementSource(audio)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 64

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      frequencyData.current = dataArray

      analyserRef.current = analyser
      source.connect(analyser)
      analyser.connect(audioContext.destination)

      const update = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray)
          frequencyData.current = [...dataArray]
          requestAnimationFrame(update)
        }
      }

      update()

      audio.onended = () => {
        analyserRef.current = null
        audioContext.close()
        resolve()
      }

      audio.onerror = () => {
        analyserRef.current = null
        audioContext.close()
        resolve()
      }

      audio.play().catch((err) => {
        console.error('Error al reproducir audio:', err)
        resolve()
      })
    })
  }

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
        title="Haz clic en GLYNNE para comenzar"
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
            <span className="relative z-10">charlando</span>
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
