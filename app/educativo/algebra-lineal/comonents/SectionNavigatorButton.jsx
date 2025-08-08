'use client';

import { useState, useEffect } from 'react';

export default function SectionNavigatorButton({ totalSections }) {
  const [currentSection, setCurrentSection] = useState(0);

  const scrollToSection = (index) => {
    const section = document.getElementById(`section-${index}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setCurrentSection(index);
    }
  };

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      scrollToSection(currentSection + 1);
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      scrollToSection(currentSection - 1);
    }
  };

  useEffect(() => {
    const preventScroll = (e) => e.preventDefault();
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(e.key)) {
        e.preventDefault();
      }
    });

    return () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
      {currentSection > 0 && (
        <button
          onClick={handlePrev}
          className="bg-gray-500 text-white px-5 py-3 rounded-xl shadow-lg hover:bg-gray-600 transition"
        >
          ← Anterior
        </button>
      )}

      {currentSection < totalSections - 1 && (
        <button
          onClick={handleNext}
          className="bg-orange-500 text-white px-5 py-3 rounded-xl shadow-lg hover:bg-orange-600 transition"
        >
          Siguiente →
        </button>
      )}
    </div>
  );
}
