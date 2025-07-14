"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { Snippet, SnippetFilters, PaginationParams } from "@/lib/types/snippet";
import { SnippetCard } from "./SnippetCard";
import { cn } from "@/lib/utils";

interface SnippetListProps {
  snippets: Snippet[];
  onSnippetClick?: (snippet: Snippet) => void;
  className?: string;
  showFilters?: boolean;
  loading?: boolean;
}

const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "Go",
  "Rust",
  "C++",
  "C#",
  "HTML",
  "CSS",
  "SQL",
  "Bash",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Other",
];

export function SnippetList({
  snippets,
  onSnippetClick,
  className,
  showFilters = true,
  loading = false,
}: SnippetListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<PaginationParams["sortBy"]>("created_at");
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Extract all unique tags from snippets
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    snippets.forEach((snippet) => {
      snippet.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [snippets]);

  // Filter snippets based on search and filters
  const filteredSnippets = useMemo(() => {
    let filtered = snippets;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (snippet) =>
          snippet.title.toLowerCase().includes(query) ||
          snippet.description?.toLowerCase().includes(query) ||
          snippet.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          snippet.content.toLowerCase().includes(query)
      );
    }

    // Language filter
    if (selectedLanguage !== "all") {
      filtered = filtered.filter(
        (snippet) => snippet.language.toLowerCase() === selectedLanguage.toLowerCase()
      );
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((snippet) =>
        selectedTags.every((tag) => snippet.tags.includes(tag))
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "updated_at":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "popularity":
          return (b.viewCount + b.likeCount + b.forkCount) - (a.viewCount + a.likeCount + a.forkCount);
        default: // created_at
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [snippets, searchQuery, selectedLanguage, selectedTags, sortBy]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLanguage("all");
    setSelectedTags([]);
    setSortBy("created_at");
  };

  const hasActiveFilters = searchQuery || selectedLanguage !== "all" || selectedTags.length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {showFilters && (
        <div className="space-y-4">
          {/* Search and filter controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search snippets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang.toLowerCase()}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Newest</SelectItem>
                  <SelectItem value="updated_at">Recently Updated</SelectItem>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={cn(selectedTags.length > 0 && "border-primary")}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tag filter panel */}
          {showFilterPanel && allTags.length > 0 && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Filter by tags</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 px-2 text-xs"
                  >
                    Clear all
                    <X className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results summary */}
      {showFilters && hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          Found {filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? "s" : ""}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}

      {/* Snippet grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-lg border bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : filteredSnippets.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            {hasActiveFilters
              ? "No snippets found matching your filters"
              : "No snippets found"}
          </p>
          {hasActiveFilters && (
            <Button
              variant="link"
              onClick={clearFilters}
              className="mt-2 text-sm"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSnippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onClick={onSnippetClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}