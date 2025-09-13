
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export const CodeEditor = ({ value, onChange, language }: CodeEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<any>(null);
  const [fallback, setFallback] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let timeoutId: number | undefined;

    const showPasteWarning = () => {
    toast.warning('Pasting code is not allowed. Please type your code manually to improve learning!', {
      duration: 5000,
      position: 'top-center',
    });
  };
  
  const preventPaste = (e: ClipboardEvent) => {
    showPasteWarning();
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const initMonaco = () => {
      try {
        if (!editorRef.current || monacoRef.current) return;
        const monaco = (window as any).monaco;
        if (!monaco) return;
        monacoRef.current = monaco.editor.create(editorRef.current, {
          value: value,
          language: getMonacoLanguage(language),
          theme: 'vs-dark',
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          minimap: { enabled: false },
          automaticLayout: true,
        });

        // Add paste event listeners at multiple levels to ensure we catch all paste events
        const editorElement = editorRef.current;
        
        // Add to Monaco's content widget
        const contentWidget = editorElement.querySelector('.monaco-editor .content');
        if (contentWidget) {
          contentWidget.addEventListener('paste', preventPaste, true);
        }
        
        // Add to the editor's input area
        const inputArea = editorElement.querySelector('textarea');
        if (inputArea) {
          inputArea.addEventListener('paste', preventPaste, true);
        }
        
        // Add to the editor element itself
        editorElement.addEventListener('paste', preventPaste, true);
        
        // Add to document as a fallback
        document.addEventListener('paste', preventPaste, true);
        
        // Cleanup function to remove event listeners
        return () => {
          if (contentWidget) {
            contentWidget.removeEventListener('paste', preventPaste, true);
          }
          if (inputArea) {
            inputArea.removeEventListener('paste', preventPaste, true);
          }
          editorElement.removeEventListener('paste', preventPaste, true);
          document.removeEventListener('paste', preventPaste, true);
        };

        monacoRef.current.onDidChangeModelContent(() => {
          onChange(monacoRef.current.getValue());
        });
        setLoaded(true);
      } catch (e) {
        setFallback(true);
      }
    };

    // If monaco already available, init immediately
    if ((window as any).monaco) {
      initMonaco();
    } else {
      // Load Monaco Editor via AMD loader
      const existing = document.querySelector('script[src*="monaco-editor@0.44.0/min/vs/loader.js"]') as HTMLScriptElement | null;
      const script = existing || document.createElement('script');
      if (!existing) {
        script.src = 'https://unpkg.com/monaco-editor@0.44.0/min/vs/loader.js';
        document.head.appendChild(script);
      }

      script.onload = () => {
        try {
          const req = (window as any).require;
          if (!req || typeof req !== 'function') throw new Error('AMD loader not available');
          req.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } });
          req(['vs/editor/editor.main'], () => {
            initMonaco();
          });
        } catch (e) {
          setFallback(true);
        }
      };

      // Fallback if loader fails to load within 3s
      timeoutId = window.setTimeout(() => {
        if (!monacoRef.current) setFallback(true);
      }, 3000);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (monacoRef.current) {
        monacoRef.current.dispose();
        monacoRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (monacoRef.current && monacoRef.current.getValue() !== value) {
      monacoRef.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (monacoRef.current) {
      const model = monacoRef.current.getModel();
      (window as any).monaco.editor.setModelLanguage(model, getMonacoLanguage(language));
    }
  }, [language]);

  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case 'python':
        return 'python';
      case 'cpp':
        return 'cpp';
      case 'javascript':
        return 'javascript';
      case 'typescript':
        return 'typescript';
      case 'java':
        return 'java';
      case 'go':
        return 'go';
      case 'c':
        return 'c';
      case 'rust':
        return 'rust';
      case 'csharp':
        return 'csharp';
      case 'php':
        return 'php';
      case 'ruby':
        return 'ruby';
      case 'kotlin':
        return 'kotlin';
      case 'swift':
        return 'swift';
      default:
        return 'plaintext';
    }
  };

  if (fallback) {
    return (
      <textarea
        className="w-full h-96 border border-primary/30 rounded-md bg-black/50 p-3 font-mono text-sm"
        style={{ minHeight: '400px' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
    );
  }

  return (
    <div
      ref={editorRef}
      className="h-96 border border-primary/30 rounded-md bg-black/50"
      style={{ minHeight: '400px' }}
    />
  );
};
