import React from 'react';
import { ArrowDownToLine } from 'lucide-react';

interface PdfViewerProps {
  pdfPath: string;
  title: string;
  downloadName?: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfPath, title, downloadName }) => {
  return (
    <section className="w-full">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-primary">{title}</h2>
      <div className="w-full mb-4">
        <iframe
          src={pdfPath + '#toolbar=0&navpanes=0&scrollbar=0'}
          title={title}
          className="w-full h-[80vh]"
          style={{ minHeight: 600, border: 'none', borderRadius: 0, boxShadow: 'none' }}
        />
      </div>
      <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-3">
        <a
          href={pdfPath}
          download={downloadName || title}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition-colors text-base font-semibold mt-2"
        >
          <ArrowDownToLine className="w-5 h-5" />
          डाउनलोड गर्नुहोस्
        </a>
        <button
          onClick={() => window.open(pdfPath, '_blank', 'noopener,noreferrer')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors text-base font-semibold mt-2"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m0 0V5a2 2 0 012-2h3m-5 5l5-5m6 18h3a2 2 0 002-2v-3m0 0v3a2 2 0 01-2 2h-3m5-5l-5 5" /></svg>
          See in Full Screen
        </button>
      </div>
    </section>
  );
};

export default PdfViewer;
