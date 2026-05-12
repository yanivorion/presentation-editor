import { useState, useEffect, useCallback } from 'react';

const LOCAL_FONTS = [
  'Neue Haas Grotesk Display Pro',
  'Neue Haas Grotesk Text Pro',
  'Wix Madefor Display',
  'Wix Madefor Text',
];

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Poppins',
  'Playfair Display', 'Merriweather', 'Raleway', 'Oswald',
  'Source Sans Pro', 'Nunito', 'Work Sans', 'DM Sans', 'Space Grotesk',
  'IBM Plex Sans', 'Libre Baskerville', 'Crimson Text', 'Archivo',
  'Manrope', 'Outfit', 'Sora', 'Lexend', 'Figtree', 'Geist',
];

const MONOSPACE_FONTS = [
  'Courier New', 'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'IBM Plex Mono',
];

const SYSTEM_FONTS = [
  'system-ui', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman',
];

export const ALL_FONTS = [...LOCAL_FONTS, ...GOOGLE_FONTS, ...MONOSPACE_FONTS, ...SYSTEM_FONTS];

const loadedFonts = new Set(['Inter', ...LOCAL_FONTS]);

export function loadFont(family) {
  if (loadedFonts.has(family) || SYSTEM_FONTS.includes(family) || LOCAL_FONTS.includes(family) || family === 'Courier New') return;
  loadedFonts.add(family);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

export default function useFonts() {
  const [fonts] = useState(ALL_FONTS);

  const ensureLoaded = useCallback((family) => {
    loadFont(family);
  }, []);

  useEffect(() => {
    loadFont('Inter');
    loadFont('Roboto');
    loadFont('Poppins');
    loadFont('DM Sans');
    loadFont('Space Grotesk');
    loadFont('Playfair Display');
  }, []);

  return { fonts, ensureLoaded };
}
