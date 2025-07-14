"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Globe, Lock, Link, Users } from "lucide-react";
import { CreateSnippetInput } from "@/lib/types/snippet";
import { SnippetEditor } from "./SnippetEditor";
import { TagInput } from "../ui/TagInput";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const createSnippetSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  content: z.string().min(1, "Content is required"),
  language: z.string().min(1, "Language is required"),
  tags: z.array(z.string()).max(10, "Maximum 10 tags allowed").optional(),
  visibility: z.enum(["public", "private", "unlisted", "team"]).optional(),
  teamId: z.string().nullable().optional(),
});

interface CreateSnippetDialogProps {
  onSubmit?: (data: CreateSnippetInput) => Promise<void>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultTeamId?: string;
  children?: React.ReactNode;
}

const VISIBILITY_OPTIONS = [
  {
    value: "public",
    label: "Public",
    description: "Anyone can view this snippet",
    icon: Globe,
  },
  {
    value: "private",
    label: "Private",
    description: "Only you can view this snippet",
    icon: Lock,
  },
  {
    value: "unlisted",
    label: "Unlisted",
    description: "Anyone with the link can view",
    icon: Link,
  },
];

export function CreateSnippetDialog({
  onSubmit,
  trigger,
  open,
  onOpenChange,
  defaultTeamId,
  children,
}: CreateSnippetDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateSnippetInput>({
    resolver: zodResolver(createSnippetSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      language: "javascript",
      tags: [],
      visibility: defaultTeamId ? "team" : "private",
      teamId: defaultTeamId || null,
    },
  });

  // Add team visibility option if creating for a team
  const visibilityOptions = defaultTeamId ? [
    ...VISIBILITY_OPTIONS,
    {
      value: "team",
      label: "Team Only",
      description: "Only team members can view",
      icon: Users,
    },
  ] : VISIBILITY_OPTIONS;

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  const handleSubmit = async (data: CreateSnippetInput) => {
    try {
      setIsSubmitting(true);
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Default behavior: call API directly
        const response = await fetch('/api/snippets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create snippet');
      }
      toast.success("Snippet created successfully");
      handleOpenChange(false);
    } catch (error) {
      toast.error("Failed to create snippet");
      console.error("Error creating snippet:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Snippet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Snippet</DialogTitle>
          <DialogDescription>
            Share your code snippet with the community or keep it private for personal use.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a descriptive title for your snippet"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what your snippet does and when to use it"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Language */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <FormControl>
                    <div className="h-[400px]">
                      <SnippetEditor
                        value={form.watch("content")}
                        onChange={(value) => form.setValue("content", value)}
                        language={field.value}
                        onLanguageChange={field.onChange}
                        height="100%"
                        showToolbar={true}
                        showLanguageSelector={true}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagInput
                      tags={field.value || []}
                      onTagsChange={field.onChange}
                      placeholder="Add tags (press Enter)"
                      maxTags={10}
                    />
                  </FormControl>
                  <FormDescription>
                    Add up to 10 tags to help others find your snippet
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visibility */}
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <div className={cn("grid gap-4", defaultTeamId ? "grid-cols-4" : "grid-cols-3")}>
                    {visibilityOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <label
                          key={option.value}
                          className={cn(
                            "relative flex cursor-pointer flex-col items-center rounded-lg border p-4 hover:bg-accent",
                            field.value === option.value && "border-primary bg-accent"
                          )}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={field.value === option.value}
                            onChange={() => field.onChange(option.value)}
                            className="sr-only"
                          />
                          <Icon className="mb-2 h-6 w-6" />
                          <span className="text-sm font-medium">{option.label}</span>
                          <span className="mt-1 text-center text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Snippet"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default CreateSnippetDialog;