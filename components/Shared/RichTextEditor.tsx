
import React, { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const quillRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !quillRef.current) {
      // @ts-ignore
      quillRef.current = new Quill(containerRef.current, {
        theme: 'snow',
        placeholder: placeholder || 'Write your message here...',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            [{ 'font': [] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image', 'table'],
            ['clean']
          ]
        }
      });

      quillRef.current.on('text-change', () => {
        const html = containerRef.current?.querySelector('.ql-editor')?.innerHTML || '';
        onChange(html);
      });
    }
  }, []);

  useEffect(() => {
    if (quillRef.current && value !== containerRef.current?.querySelector('.ql-editor')?.innerHTML) {
       quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      <div ref={containerRef} className="h-80" />
    </div>
  );
};
