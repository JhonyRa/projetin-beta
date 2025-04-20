"use client";

import { Suspense } from "react";
import { UploadVideoForm } from "@/components/upload-video-form";
import { Card } from "@/components/ui/card";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function UploadVideoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const folderId = searchParams.get('folderId');
  
  const handleBack = () => {
    if (folderId) {
      router.push(`/dashboard?folderId=${folderId}`);
    } else {
      router.push('/dashboard');
    }
  };
  
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="text-2xl font-semibold">Upload de Vídeo</h1>
      </div>
      <Card className="p-6">
        <UploadVideoForm initialFolderId={folderId} />
      </Card>
    </div>
  );
}

export default function UploadVideoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<Card className="p-6"><div>Carregando...</div></Card>}>
        <UploadVideoContent />
      </Suspense>
    </div>
  );
}
