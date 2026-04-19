"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function RichTextEditor({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'blockquote'],
      ['clean']
    ],
  }), []);

  return (
    <div className="rich-text-editor-container border-divider rounded-xl overflow-hidden focus-within:border-primary border transition-colors bg-content2">
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
        className="text-foreground"
      />
      <style jsx global>{`
        .rich-text-editor-container .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid hsl(var(--nextui-divider));
          background-color: hsl(var(--nextui-content3));
          font-family: inherit;
        }
        .rich-text-editor-container .ql-container.ql-snow {
          border: none;
          min-height: 200px;
          font-family: inherit;
          font-size: 1rem;
        }
        .rich-text-editor-container .ql-editor {
          min-height: 200px;
        }
        .rich-text-editor-container .ql-editor.ql-blank::before {
          color: hsl(var(--nextui-foreground) / 0.5);
          font-style: normal;
        }
        /* Override stroke and fill colors for toolbar icons for dark mode */
        .rich-text-editor-container .ql-snow .ql-stroke {
          stroke: #ffffff !important;
        }
        .rich-text-editor-container .ql-snow .ql-fill,
        .rich-text-editor-container .ql-snow .ql-stroke.ql-fill {
          fill: #ffffff !important;
        }
        .rich-text-editor-container .ql-snow .ql-picker {
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
