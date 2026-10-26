import { useCallback, useEffect, useRef, useState } from 'react';
import { limpiarConsultaVoz } from '../Utils/busquedaProductos';

const ERROR_MESSAGES = {
  'audio-capture': 'No se encontró un micrófono disponible.',
  'not-allowed': 'Permiso de micrófono rechazado. Habilítalo en el navegador para buscar por voz.',
  'no-speech': 'No se detectó voz. Intenta hablar más cerca del micrófono.',
  network: 'No fue posible procesar la voz. Revisa tu conexión e inténtalo nuevamente.',
  aborted: ''
};

const useReconocimientoVoz = ({ onResult, language = 'es-MX' } = {}) => {
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');

  const SpeechRecognition = typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;
  const isSupported = Boolean(SpeechRecognition);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.onend = null;
    recognition.onerror = null;
    recognition.onresult = null;
    recognition.abort();
    recognitionRef.current = null;
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognition || isListening) return;

    setError('');
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      setError(ERROR_MESSAGES[event.error] ?? 'No se pudo reconocer la voz. Inténtalo nuevamente.');
    };
    recognition.onresult = (event) => {
      const transcript = limpiarConsultaVoz(event.results?.[0]?.[0]?.transcript);
      if (transcript) {
        onResultRef.current?.(transcript);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      setError('No se pudo iniciar el micrófono. Inténtalo nuevamente.');
    }
  }, [SpeechRecognition, isListening, language]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    error,
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleListening
  };
};

export default useReconocimientoVoz;
