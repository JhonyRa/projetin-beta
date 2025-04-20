"use client";

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { baseApi } from '@/configs/axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@clerk/nextjs';
import { Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FolderSelector } from './folder-selector';
import type { Folder } from './folder-selector';

interface UploadVideoFormProps {
  initialFolderId?: string | null;
}

export function UploadVideoForm({ initialFolderId }: UploadVideoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const router = useRouter();
  const { getToken } = useAuth();
  const { toast } = useToast();

  // Fetch folder details when initialFolderId is provided
  useEffect(() => {
    async function fetchFolder() {
      if (!initialFolderId) {
        // Se não tiver folderId inicial, não mostra o seletor e usa a pasta raiz
        setShowFolderSelector(false);
        setSelectedFolder({ id: 'root', name: 'Root' });
        return;
      }

      try {
        // Get token with better error handling
        let token;
        try {
          token = await getToken();
        } catch (authError) {
          console.error('Authentication error:', authError);
          throw new Error('Failed to get authentication token');
        }
        
        const response = await baseApi.get(`/folders/${initialFolderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Set selected folder with data from API
        setSelectedFolder({
          id: response.data.id,
          name: response.data.name,
          description: response.data.description
        });
        
        // Quando vem de uma pasta específica, não mostra o seletor por padrão
        setShowFolderSelector(false);
      } catch (error) {
        console.error("Error fetching folder:", error);
        // Em caso de erro, usa a pasta raiz
        setSelectedFolder({ id: 'root', name: 'Root' });
        setShowFolderSelector(false);
      }
    }

    fetchFolder();
  }, [initialFolderId, getToken]);

  const handleFolderSelect = (folder: Folder) => {
    setSelectedFolder(folder);
    setShowFolderSelector(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select a video file to upload");
      return;
    }
    
    if (!selectedFolder) {
      setError("Please select a destination folder");
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      // Get token with better error handling
      let token;
      try {
        token = await getToken();
      } catch (authError) {
        console.error('Authentication error:', authError);
        throw new Error('Failed to get authentication token');
      }
      
      // Create FormData to send file and metadata
      const formData = new FormData();
      formData.append("video", file);
      formData.append('title', title);
      
      if (description) {
        formData.append('description', description);
      }
      
      // Use the folder ID, handling the special "root" case
      if (selectedFolder && selectedFolder.id !== 'root') {
        formData.append('folderId', selectedFolder.id);
      }
      
      // Upload with progress tracking
      await baseApi.post('/videos/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });
      
      toast({
        title: "Video uploaded successfully",
        description: "Your video has been uploaded and is now being processed."
      });
      
      // Redirect to the folder where the video was uploaded
      if (selectedFolder && selectedFolder.id !== 'root') {
        router.push(`/dashboard?folderId=${selectedFolder.id}`);
      } else {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      console.error("Error uploading video:", error);
      
      if (error instanceof Error) {
        setError(error.message || "An error occurred while uploading the video. Please try again.");
      }
      
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Check file size (max 100MB)
      const fileSize = e.target.files[0].size;
      const maxSize = 100 * 1024 * 1024; // 100MB
      
      if (fileSize > maxSize) {
        setError(`File size exceeds the maximum limit of 100MB. Your file is ${(fileSize / (1024 * 1024)).toFixed(2)}MB.`);
        return;
      }
      
      // Check file type
      const fileType = e.target.files[0].type;
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
      
      if (!validTypes.includes(fileType)) {
        setError("Unsupported file format. Please use MP4, MOV, or AVI.");
        return;
      }
      
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  // No need for folder selection handler anymore

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div>
        <Label htmlFor="title">Video title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <Label htmlFor="file">Select a video file</Label>
        <div className="mt-1 flex items-center">
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            accept="video/mp4,video/quicktime,video/x-msvideo"
            className="hidden"
            disabled={isSubmitting}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("file")?.click()}
            className="w-full"
            disabled={isSubmitting}
          >
            <Upload className="mr-2 h-4 w-4" />
            {file ? file.name : "Choose video file"}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Supported formats: MP4, MOV, AVI. Maximum size: 100MB
        </p>
      </div>
      
      <div>
        <div className="flex justify-between items-center">
          <Label htmlFor="folder">Destination folder</Label>
        </div>
        
        {showFolderSelector ? (
          <div className="mt-1">
            <FolderSelector 
              onSelect={handleFolderSelect} 
              initialFolder={selectedFolder}
            />
          </div>
        ) : (
          selectedFolder && (
            <div className="p-2 border rounded-md mt-1 bg-gray-50">
              <p className="text-sm">{selectedFolder.name}</p>
            </div>
          )
        )}
      </div>
      
      {/* This section is kept for the future implementation of video permissions */}
      {/* <div>
        <Label>Select who can watch</Label>
        <PermissionSelector 
          onSelect={setPermissions} 
          disabled={isSubmitting}
        />
      </div> */}
      
      {isSubmitting && uploadProgress > 0 && (
        <div className="w-full">
          <Label className="text-sm mb-1 block">Upload progress: {uploadProgress}%</Label>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }} 
            />
          </div>
        </div>
      )}
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : "Upload Video"}
      </Button>
    </form>
  );
}
