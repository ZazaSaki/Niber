import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Download, FileCode, Eye, Check, Save } from 'lucide-react';
import { MermaidChart } from './MermaidChart';

interface TranscriptionEditorProps {
  markdown: string;
  setMarkdown: (value: string) => void;
  onSave?: () => void;
}

export const TranscriptionEditor: React.FC<TranscriptionEditorProps> = ({ markdown, setMarkdown, onSave }) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notes_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!markdown) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-8 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed transition-colors">
        <FileCode size={48} className="mb-4 opacity-50" />
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">No transcription yet</p>
        <p className="text-sm">Upload an image and click transcribe to see the results here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('write')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'write' 
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <FileCode size={14} /> Raw
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'preview' 
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Eye size={14} /> Preview
          </button>
        </div>

        <div className="flex items-center gap-2">
           {onSave && (
            <button
              onClick={onSave}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm mr-2"
              title="Save to Book"
            >
              <Save size={16} /> Save Note
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
            title="Copy to Clipboard"
          >
            {copied ? <Check size={18} className="text-green-600 dark:text-green-400" /> : <Copy size={18} />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
            title="Download .md"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'write' ? (
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="w-full h-full p-4 resize-none focus:outline-none focus:ring-0 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
            spellCheck={false}
          />
        ) : (
          <div className="w-full h-full p-6 overflow-y-auto prose prose-slate dark:prose-invert prose-sm max-w-none prose-headings:font-semibold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 transition-colors">
            <ReactMarkdown
              components={{
                code(props) {
                  const { children, className, node, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || '');
                  
                  if (match && match[1] === 'mermaid') {
                    return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
                  }

                  return match ? (
                    <div className="bg-slate-800 dark:bg-slate-950 text-slate-100 rounded-md p-4 overflow-x-auto my-4 not-prose border border-slate-700 dark:border-slate-800">
                       <code className={className} {...rest}>{children}</code>
                    </div>
                  ) : (
                    <code className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-sm font-medium" {...rest}>{children}</code>
                  );
                }
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};