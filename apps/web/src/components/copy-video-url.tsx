"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";

interface CopyVideoUrlProps {
  videoUrl: string;
}

export function CopyVideoUrl({ videoUrl }: CopyVideoUrlProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      setCopied(true);
      toast({
        title: "URL Copied",
        description: "The video URL has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy the URL. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-grow">
      <div className="flex items-center space-x-2">
        <Input
          value={videoUrl}
          readOnly
          className="flex-grow font-mono text-sm"
        />
        <Button onClick={copyToClipboard} variant="outline">
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="ml-2">{copied ? "Copied!" : "Copy URL"}</span>
        </Button>
      </div>
    </div>
  );
}
