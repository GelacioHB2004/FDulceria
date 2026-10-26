import { act, renderHook } from '@testing-library/react';
import useReconocimientoVoz from './useReconocimientoVoz';

let latestRecognition;

class SpeechRecognitionMock {
  constructor() {
    latestRecognition = this;
  }

  start() {
    this.onstart?.();
  }

  stop() {
    this.onend?.();
  }

  abort() {
    this.onend?.();
  }
}

describe('useReconocimientoVoz', () => {
  afterEach(() => {
    latestRecognition = null;
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
  });

  test('informa cuando el navegador no soporta reconocimiento', () => {
    const { result } = renderHook(() => useReconocimientoVoz());
    expect(result.current.isSupported).toBe(false);
  });

  test('inicia la escucha y entrega el texto reconocido', () => {
    window.webkitSpeechRecognition = SpeechRecognitionMock;
    const onResult = jest.fn();
    const { result } = renderHook(() => useReconocimientoVoz({ onResult }));

    act(() => result.current.startListening());
    expect(result.current.isListening).toBe(true);

    act(() => {
      latestRecognition.onresult({
        results: [[{ transcript: '  gomitas  ' }]]
      });
    });
    expect(onResult).toHaveBeenCalledWith('gomitas');

    act(() => {
      result.current.stopListening();
    });
    expect(result.current.isListening).toBe(false);
  });

  test('muestra un mensaje cuando se rechaza el micrófono', () => {
    window.SpeechRecognition = SpeechRecognitionMock;
    const { result } = renderHook(() => useReconocimientoVoz());

    act(() => result.current.startListening());
    act(() => {
      latestRecognition.onerror({ error: 'not-allowed' });
    });

    expect(result.current.error).toContain('Permiso de micrófono rechazado');
  });
});
