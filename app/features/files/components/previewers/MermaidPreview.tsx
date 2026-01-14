/**
 * MermaidPreview Component
 * Displays Mermaid diagrams
 */

import { useEffect, useRef } from "react";
import mermaid from "mermaid";
import { useFileContent } from "../../hooks/useFiles";
import { Card, CardContent } from "~/components/ui/card";
import { useTranslation } from "~/lib/i18n/useTranslation";

export interface MermaidPreviewProps {
  fileId: string;
  fileName: string;
}

/**
 * MermaidPreview component
 */
export function MermaidPreview({ fileId, fileName }: MermaidPreviewProps) {
  const { t } = useTranslation();
  const { data: content, isLoading, error } = useFileContent(fileId);
  const mermaidRef = useRef<HTMLDivElement>(null);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
    });
  }, []);

  // Render Mermaid diagram
  useEffect(() => {
    if (content && mermaidRef.current) {
      const id = `mermaid-${fileId}`;
      mermaidRef.current.innerHTML = "";
      mermaidRef.current.id = id;

      mermaid
        .render(id, content)
        .then((result) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = result.svg;
          }
        })
        .catch((err) => {
          console.error("Error rendering Mermaid diagram:", err);
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = `<p class="text-destructive">Error rendering diagram: ${err.message}</p>`;
          }
        });
    }
  }, [content, fileId]);

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

  return (
    <Card>
      <CardContent className="p-6">
        <div className="border rounded-md overflow-auto max-h-[600px] p-4">
          <div ref={mermaidRef} className="mermaid-container flex items-center justify-center" />
        </div>
      </CardContent>
    </Card>
  );
}






