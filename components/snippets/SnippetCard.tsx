"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Heart, GitFork, Code2, Lock, Globe, Link } from "lucide-react";
import { Snippet } from "@/lib/types/snippet";
import { cn } from "@/lib/utils";

interface SnippetCardProps {
  snippet: Snippet;
  onClick?: (snippet: Snippet) => void;
  className?: string;
}

export function SnippetCard({ snippet, onClick, className }: SnippetCardProps) {
  const getVisibilityIcon = () => {
    switch (snippet.visibility) {
      case "private":
        return <Lock className="h-3 w-3" />;
      case "unlisted":
        return <Link className="h-3 w-3" />;
      default:
        return <Globe className="h-3 w-3" />;
    }
  };

  const getLanguageColor = (language: string): string => {
    const colors: Record<string, string> = {
      javascript: "bg-yellow-500",
      typescript: "bg-blue-500",
      python: "bg-green-500",
      java: "bg-red-500",
      go: "bg-cyan-500",
      rust: "bg-orange-500",
      cpp: "bg-pink-500",
      csharp: "bg-purple-500",
      html: "bg-orange-600",
      css: "bg-blue-600",
      sql: "bg-gray-600",
      default: "bg-gray-500",
    };
    return colors[language.toLowerCase()] || colors.default;
  };

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-shadow cursor-pointer",
        "dark:hover:shadow-gray-800/50",
        className
      )}
      onClick={() => onClick?.(snippet)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {snippet.title}
            </CardTitle>
            {snippet.description && (
              <CardDescription className="line-clamp-2">
                {snippet.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            {getVisibilityIcon()}
            <span className="text-xs">{snippet.visibility}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="gap-1">
            <div className={cn("w-2 h-2 rounded-full", getLanguageColor(snippet.language))} />
            {snippet.language}
          </Badge>
          {snippet.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {snippet.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{snippet.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2"
              onClick={(e) => {
                e.stopPropagation();
                // Handle view action
              }}
            >
              <Eye className="h-4 w-4" />
              <span>{snippet.viewCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2"
              onClick={(e) => {
                e.stopPropagation();
                // Handle like action
              }}
            >
              <Heart className="h-4 w-4" />
              <span>{snippet.likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2"
              onClick={(e) => {
                e.stopPropagation();
                // Handle fork action
              }}
            >
              <GitFork className="h-4 w-4" />
              <span>{snippet.forkCount}</span>
            </Button>
          </div>
          <div className="text-xs">
            {new Date(snippet.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}