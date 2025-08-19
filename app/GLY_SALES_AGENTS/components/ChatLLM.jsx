'use client'

import React, { useEffect, useRef, useState } from 'react'
import MenuLateral from '../components/menuLateral'
import Aalert from '../components/alertSalirChaarla'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const VoiceChatFlame = () => {
  const canvasRef = useRef(null)
  const frequencyData = useRef(null)
  const analyserRef = useRef(null)
  const animationIdRef = useRef(null)
  const audioCtxRef = useRef(null)

  const [conversando, setConversando] = useState(false)
  const [activo, setActivo] = useState(false)
  const [iconVisible, setIconVisible] = useState(true)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [showPopup, setShowPopup] = useState(false)

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()

  // 🎨 Animación del canvas
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
      if (analyserRef.current && frequencyData.current) {
        analyserRef.current.getByteFrequencyData(frequencyData.current)
      }

      const width = canvas.width
      const height = canvas.height
      const numBars = frequencyData.current ? frequencyData.current.length : 0
      const spacing = 4
      const totalSpacing = spacing * (numBars - 1)
      const barWidth = numBars > 0 ? (width - totalSpacing) / numBars : 0

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

  // 🔊 Reproducir audio y alimentar el AnalyserNode
  const reproducirAudio = (audioBase64) => {
    return new Promise((resolve) => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
        analyserRef.current = audioCtxRef.current.createAnalyser()
        analyserRef.current.fftSize = 128
        frequencyData.current = new Uint8Array(analyserRef.current.frequencyBinCount)
      }

      const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: 'audio/mp3' })
      const url = URL.createObjectURL(audioBlob)
      const audio = new Audio(url)
      audio.crossOrigin = 'anonymous'

      // Conectar al AnalyserNode
      const source = audioCtxRef.current.createMediaElementSource(audio)
      source.connect(analyserRef.current)
      analyserRef.current.connect(audioCtxRef.current.destination)

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

  // 🆕 Watchdog: desbloquea si el micrófono queda colgado
  useEffect(() => {
    if (!activo) return

    const watchdog = setInterval(() => {
      if (!listening && !conversando && transcript.trim() === '') {
        console.warn('Reactivando micrófono por inactividad o bloqueo...')
        setIconVisible(true)
        setActivo(false)
        SpeechRecognition.stopListening()
      }
    }, 3000)

    return () => clearInterval(watchdog)
  }, [activo, listening, conversando, transcript])

  // 🗣 Lógica de conversación
  useEffect(() => {
    const handleConversation = async () => {
      if (!listening && transcript) {
        if (!transcript.trim()) {
          resetTranscript()
          return
        }

        try {
          const res = await fetch('https://gly-tts-back.onrender.com/conversar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto: transcript }),
          })

          if (!res.ok) throw new Error(`HTTP ${res.status}`)

          const data = await res.json()
          if (!data.audio_base64) throw new Error('Audio inválido')

          if (transcript.toLowerCase().includes('salir')) {
            SpeechRecognition.stopListening()
            setActivo(false)
            setIconVisible(true)
            resetTranscript()
            return
          }

          await reproducirAudio(data.audio_base64)
          resetTranscript()
          SpeechRecognition.startListening({ continuous: false, language: 'es-CO' })
        } catch (err) {
          console.error('Error:', err)
          alert('Hubo un problema con la API')
          SpeechRecognition.stopListening()
          setActivo(false)
          setIconVisible(true)
        } finally {
          setConversando(false)
        }
      }
    }

    if (activo && !listening) handleConversation()
  }, [transcript, listening, activo, resetTranscript])

  // 🔄 Inicio / reinicio de conversación
  const iniciarConversacion = () => {
    if (activo) {
      // Reinicio manual si está colgado
      setActivo(false)
      setIconVisible(true)
      SpeechRecognition.stopListening()
      resetTranscript()
      return
    }

    if (!browserSupportsSpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz.')
      return
    }

    setActivo(true)
    setConversando(true)
    setIconVisible(false)
    SpeechRecognition.startListening({ continuous: false, language: 'es-CO' })
  }

  // 🆕 Detectar dispositivos móviles
  useEffect(() => {
    const checkDevice = () => {
      const isMobile = window.innerWidth <= 600
      setShowPopup(isMobile)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)

    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return (
    <div
      className={`w-screen h-screen flex flex-row bg-white text-black transition-all duration-300 ${
        menuAbierto ? 'overflow-auto' : 'overflow-hidden'
      }`}
    >
      <div className="mt-[32px]">
        <MenuLateral onToggle={(abierto) => setMenuAbierto(abierto)} />
      </div>
      <Aalert />

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
            <canvas ref={canvasRef} className="w-100 h-full block" />

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

      {/* 🆕 Popup para dispositivos móviles */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-[80vw] max-w-4xl px-[4vw] py-[5vh] text-gray-800"
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="w-full flex flex-col items-center justify-center gap-[2vh]">
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-bold text-center text-black"
                  style={{
                    fontSize: 'clamp(1.4rem, 2.5vw, 2.3rem)',
                    lineHeight: '1.3',
                  }}
                >
                  <span className="text-black">Oye!! Espera.</span>
                </motion.h2>

                <Image
                  src="/logo2.png"
                  alt="Logo GLY-IA"
                  width={70}
                  height={70}
                  className="mt-[-8px]"
                />

                <p
                  className="text-center text-gray-600 max-w-[70ch]"
                  style={{
                    fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
                    lineHeight: '1.6',
                  }}
                >
                  Este servicio solo está disponible en Google Chrome. Por favor, Espera nuestra app movil pronto  <strong>GLYNNE</strong>.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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