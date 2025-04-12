import React, { useRef, useState } from "react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "bootstrap/dist/css/bootstrap.min.css";

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(`# Welcome 👋

## Features

- **Bold**, *Italic*, ~~Strikethrough~~
- [Links](https://google.com)
- \`Inline code\` and:

\`\`\`js
// Code blocks
function hello() {
  console.log("Say Hii!");
}
\`\`\`

- <span style="color:red;">Raw HTML support</span>
- Image support
- Task list:
  - [x] Markdown
  - [x] HTML
  - [ ] Export as PDF

| Feature | Status |
|--------|--------|
| Tables | ✅ |
| Emojis | 🚀 |
`);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Function implementations remain the same...
  const waitForImagesToLoad = async (container) => {
    const images = container.getElementsByTagName("img");
    const promises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });
    return Promise.all(promises);
  };

  const handleExportPDF = async () => {
    const element = previewRef.current;
    if (!element) return;

    try {
      const originalStyle = element.style.display;
      element.style.display = "block";
      element.style.position = "fixed";
      element.style.top = "0";
      element.style.left = "0";
      element.style.zIndex = "-9999";
      element.style.width = "800px";
      element.style.background = "white";
      
      await waitForImagesToLoad(element);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff'
      });
      
      element.style.display = originalStyle;
      element.style.position = "";
      element.style.top = "";
      element.style.left = "";
      element.style.zIndex = "";
      element.style.width = "";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;
      let heightLeft = imgHeight;

      while (heightLeft > 0) {
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        if (heightLeft > 0) {
          pdf.addPage();
          position = 0;
        }
      }

      pdf.save("markdown-export.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. See console for details.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setMarkdown((prev) => `${prev}\n\n![Uploaded Image](${objectUrl})\n`);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const uploadImageCommand = {
    name: 'upload-image',
    keyCommand: 'upload-image',
    buttonProps: { 'aria-label': 'Upload image', title: 'Upload Image' },
    icon: (
      <span className="toolbar-btn-with-text">
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '4px' }}>
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
        Upload Image
      </span>
    ),
    execute: () => {
      triggerFileInput();
    },
  };
  
  const exportPdfCommand = {
    name: 'export-pdf',
    keyCommand: 'export-pdf',
    buttonProps: { 'aria-label': 'Download PDF', title: 'Download PDF' },
    icon: (
      <span className="toolbar-btn-with-text">
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '4px' }}>
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
        </svg>
        Download PDF
      </span>
    ),
    execute: () => {
      handleExportPDF();
    },
  };

  const extraCommands = [
    commands.divider,
    uploadImageCommand,
    exportPdfCommand,
  ];

  return (
    <div className="container-fluid p-0 markdown-editor-custom">
      
      <div className="d-flex justify-content-between align-items-center flex-wrap p-2 header-container">
        <h1 className="markdown-title">Markdown Editor</h1>
      </div>
      
      <div className="markdown-full-width">
        <MDEditor
          value={markdown}
          onChange={setMarkdown}
          height={`calc(100vh - ${60}px)`}
          preview="live"
          hideToolbar={false}
          fullscreen={false}
          toolbarSticky={true}
          toolbarTop={60}
          commands={[
            ...commands.getCommands(), 
            ...extraCommands
          ]}
        />
        
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />

        <div
          ref={previewRef}
          className="p-4 rounded shadow-lg bg-light mt-3 export-preview"
          data-color-mode="light"
          style={{ 
            maxWidth: "800px", 
            margin: "0 auto",
            display: "none", // Hidden initially, made visible during export
            fontFamily: "Arial, sans-serif"
          }}
        >
          <h2 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "20px" }}>
            {markdown.split('\n')[0]?.replace(/^#\s+/, '') || 'Markdown Export'}
          </h2>
          <MDEditor.Markdown
            source={markdown}
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
          />
        </div>
      </div>
    </div>
  );
}
