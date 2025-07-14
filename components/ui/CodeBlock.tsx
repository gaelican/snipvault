"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Download, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
  showActions?: boolean;
}

export function CodeBlock({
  code,
  language = "plaintext",
  title,
  showLineNumbers = true,
  maxHeight = "400px",
  className,
  showActions = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Code downloaded");
  };

  const lines = code.split("\n");
  const maxLineNumberWidth = String(lines.length).length;

  const getLanguageStyles = (lang: string): string => {
    const styles: Record<string, string> = {
      javascript: "language-javascript",
      typescript: "language-typescript",
      python: "language-python",
      java: "language-java",
      go: "language-go",
      rust: "language-rust",
      cpp: "language-cpp",
      csharp: "language-csharp",
      html: "language-html",
      css: "language-css",
      sql: "language-sql",
      bash: "language-bash",
      json: "language-json",
      yaml: "language-yaml",
      markdown: "language-markdown",
    };
    return styles[lang.toLowerCase()] || "";
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || showActions) && (
        <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
          <div className="flex items-center gap-2">
            {title && <span className="text-sm font-medium">{title}</span>}
            {language && language !== "plaintext" && (
              <Badge variant="secondary" className="text-xs">
                {language}
              </Badge>
            )}
          </div>
          {showActions && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={copyToClipboard}
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={downloadCode}
                title="Download"
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}
      <div
        className="relative overflow-auto bg-muted/30"
        style={{ maxHeight }}
      >
        <pre className={cn("p-4", getLanguageStyles(language))}>
          <code className="text-sm">
            {lines.map((line, index) => (
              <div key={index} className="table-row">
                {showLineNumbers && (
                  <span
                    className="table-cell select-none pr-4 text-right text-muted-foreground"
                    style={{ minWidth: `${maxLineNumberWidth + 0.5}ch` }}
                  >
                    {index + 1}
                  </span>
                )}
                <span className="table-cell">
                  {line || <span>&nbsp;</span>}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </Card>
  );
}