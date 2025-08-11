'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSignOutAlt } from 'react-icons/fa'

export default function AlertSalida() {
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    setShowAlert(true)
    const hideTimeout = setTimeout(() => setShowAlert(false), 8000)

    const interval = setInterval(() => {
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 8000)
    }, 5 * 60 * 1000)

    return () => {
      clearInterval(interval)
      clearTimeout(hideTimeout)
    }
  }, [])

  return (
    <AnimatePresence>
      {showAlert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -30 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed top-4 right-4 mt-[30px] z-50"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0px rgba(0,0,0,0)',
                '0 0 12px rgba(0,0,0,0.4)',
                '0 0 0px rgba(0,0,0,0)',
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'loop',
            }}
            className="bg-white text-black  rounded-lg px-5 py-3 max-w-xs shadow-md"
            style={{ fontFamily: 'sans-serif' }}
          >
            <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
              <FaSignOutAlt className="text-black" /> Salir de charla
            </h3>
            <p className="text-xs leading-snug">
              Di <strong>“salir”</strong> para terminar la conversación.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
