
import { useEffect, useRef } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export const CodeEditor = ({ value, onChange, language }: CodeEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    // Load Monaco Editor
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/monaco-editor@0.44.0/min/vs/loader.js';
    script.onload = () => {
      (window as any).require.config({ 
        paths: { 
          vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' 
        } 
      });
      
      (window as any).require(['vs/editor/editor.main'], () => {
        if (editorRef.current && !monacoRef.current) {
          monacoRef.current = (window as any).monaco.editor.create(editorRef.current, {
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

          monacoRef.current.onDidChangeModelContent(() => {
            onChange(monacoRef.current.getValue());
          });
        }
      });
    };
    
    if (!document.querySelector('script[src*="monaco-editor"]')) {
      document.head.appendChild(script);
    }

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
        monacoRef.current = null;
      }
    };
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
      default:
        return 'python';
    }
  };

  return (
    <div 
      ref={editorRef} 
      className="h-96 border border-primary/30 rounded-md bg-black/50"
      style={{ minHeight: '400px' }}
    />
  );
};
