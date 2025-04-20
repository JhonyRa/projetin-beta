"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoEmbedCodeProps {
  videoId: string;
}

export function VideoEmbedCode({ videoId }: VideoEmbedCodeProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const embedCode = `<iframe width="560" height="315" src="https://softube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast({
        title: "Embed Code Copied",
        description: "The embed code has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy the embed code. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-grow">
      <div className="flex items-center space-x-2">
        <Input
          value={embedCode}
          readOnly
          className="flex-grow font-mono text-sm"
        />
        <Button onClick={copyToClipboard} variant="outline">
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="ml-2">{copied ? "Copied!" : "Copy Embed"}</span>
        </Button>
      </div>
    </div>
  );
}
