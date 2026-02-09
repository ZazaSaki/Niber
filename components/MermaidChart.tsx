import React, { useState, useEffect } from 'react';
import mermaid from 'mermaid';

export const MermaidChart = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    // Initialize mermaid config
    // We do this inside the component to ensure it picks up the correct theme on mount
    // checking document classList for 'dark'
    const isDark = document.documentElement.classList.contains('dark');
    mermaid.initialize({ 
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      // Clean up the chart string to remove potential leading/trailing whitespace issues
      const cleanChart = chart.trim();
      if (!cleanChart) return;

      try {
        setError(false);
        // Generate a unique, valid CSS ID for each render
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        // mermaid.render returns a promise with the SVG string
        const { svg } = await mermaid.render(id, cleanChart);
        
        if (isMounted) {
          setSvg(svg);
          setError(false);
        }
      } catch (err) {
        // Log warning instead of error to avoid cluttering console for expected parsing failures
        console.warn('Mermaid rendering failed:', err);
        if (isMounted) {
          setError(true);
        }
      }
    };

    // Small timeout to allow DOM/styles to settle if necessary, though usually not required for render()
    const timeoutId = setTimeout(renderChart, 0);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [chart]);

  if (error) {
    return (
      <div className="my-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-xs font-mono overflow-x-auto">
        <p className="font-bold mb-2">Unable to render diagram (syntax error or layout issue):</p>
        <pre className="whitespace-pre-wrap">{chart}</pre>
      </div>
    );
  }

  if (!svg) {
    return <div className="text-slate-400 dark:text-slate-500 text-sm italic p-4 text-center animate-pulse">Generating diagram...</div>;
  }

  return (
    <div 
      className="mermaid-wrapper flex justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg my-6 shadow-sm overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};