"use client";

import React, { useRef, useEffect } from "react";
import Editor, { OnMount, OnChange, Monaco } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Copy, Download, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SnippetEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  onLanguageChange?: (language: string) => void;
  readOnly?: boolean;
  height?: string;
  className?: string;
  showToolbar?: boolean;
  showLanguageSelector?: boolean;
}

const LANGUAGE_OPTIONS = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "plaintext", label: "Plain Text" },
];

export function SnippetEditor({
  value,
  onChange,
  language = "javascript",
  onLanguageChange,
  readOnly = false,
  height = "400px",
  className,
  showToolbar = true,
  showLanguageSelector = true,
}: SnippetEditorProps) {
  const { theme, systemTheme } = useTheme();
  const editorRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const monacoTheme = currentTheme === "dark" ? "vs-dark" : "vs";

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure Monaco editor options
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: "on",
      renderLineHighlight: "all",
      folding: true,
      contextmenu: true,
      wordWrap: "on",
      automaticLayout: true,
    });

    // Add custom keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save command - can be handled by parent component
    });
  };

  const handleEditorChange: OnChange = (value, event) => {
    onChange?.(value || "");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const downloadSnippet = () => {
    const blob = new Blob([value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snippet.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Snippet downloaded");
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const editorHeight = isFullscreen ? "calc(100vh - 120px)" : height;

  return (
    <Card
      className={cn(
        "overflow-hidden",
        isFullscreen && "fixed inset-4 z-50",
        className
      )}
    >
      {showToolbar && (
        <div className="border-b px-4 py-2 flex items-center justify-between bg-muted/50">
          <div className="flex items-center gap-2">
            {showLanguageSelector && (
              <Select
                value={language}
                onValueChange={onLanguageChange}
                disabled={readOnly}
              >
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={copyToClipboard}
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={downloadSnippet}
              title="Download snippet"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
      <div style={{ height: editorHeight }}>
        <Editor
          defaultLanguage={language}
          language={language}
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme={monacoTheme}
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: "on",
            renderLineHighlight: "all",
            folding: true,
            contextmenu: true,
            wordWrap: "on",
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            tabSize: 2,
            insertSpaces: true,
          }}
        />
      </div>
    </Card>
  );
}