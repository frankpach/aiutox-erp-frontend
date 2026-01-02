/**
 * MarkdownPreview Component
 * Displays Markdown files with support for Mermaid diagrams
 */

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import { useFileContent } from "../../hooks/useFiles";
import { Card, CardContent } from "~/components/ui/card";
import { useTranslation } from "~/lib/i18n/useTranslation";

// Dynamically import remark-mermaid only when needed (to avoid Node.js dependencies in browser)
let remarkMermaid: any = null;
const loadRemarkMermaid = async () => {
  if (!remarkMermaid) {
    try {
      const module = await import("remark-mermaid");
      remarkMermaid = module.default || module;
    } catch (error) {
      console.warn("Failed to load remark-mermaid:", error);
      // Return a no-op plugin if remark-mermaid fails to load
      remarkMermaid = () => {};
    }
  }
  return remarkMermaid;
};

export interface MarkdownPreviewProps {
  fileId: string;
  fileName: string;
}

/**
 * MarkdownPreview component
 */
export function MarkdownPreview({ fileId, fileName }: MarkdownPreviewProps) {
  const { t } = useTranslation();
  const { data: content, isLoading, error } = useFileContent(fileId);
  const [mermaidPlugin, setMermaidPlugin] = useState<any>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  // Load remark-mermaid dynamically
  useEffect(() => {
    let isMounted = true;
    loadRemarkMermaid().then((plugin) => {
      if (isMounted) {
        setMermaidPlugin(plugin);
        setMermaidLoaded(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
    });
  }, []);

  // Render Mermaid diagrams after content loads
  useEffect(() => {
    if (content && mermaidLoaded) {
      // Wait a bit for ReactMarkdown to render
      const timer = setTimeout(() => {
        mermaid.run();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [content, mermaidLoaded]);

  // Build remark plugins array (only include mermaid if loaded)
  const remarkPlugins = useMemo(() => {
    const plugins: any[] = [remarkGfm];
    if (mermaidPlugin) {
      plugins.push(mermaidPlugin);
    }
    return plugins;
  }, [mermaidPlugin]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>{t("files.loading")}</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">
            {t("files.error") || "Error loading file content"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            {t("files.previewNotAvailable") || "Preview not available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Limit content size for preview (5MB max)
  const MAX_CONTENT_SIZE = 5 * 1024 * 1024; // 5MB
  if (content.length > MAX_CONTENT_SIZE) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            {t("files.fileTooLarge") || "File is too large to preview. Please download it."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="border rounded-md overflow-auto max-h-[600px] prose prose-sm dark:prose-invert max-w-none p-4">
          <ReactMarkdown
            remarkPlugins={remarkPlugins}
          >
            {content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}

