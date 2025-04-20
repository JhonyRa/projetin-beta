"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { PermissionSelector } from "./ui/permission-selector";
import { FolderSelector } from "./folder-selector";

type PermissionItem = {
  id: string;
  name: string;
  type: "user" | "group";
};

type Folder = {
  id: string;
  name: string;
};

export function AddContentForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log("Submitting:", {
      title,
      description,
      file,
      permissions,
      folder: selectedFolder,
    });
    // Redirect to the manage content page after submission
    router.push("/manage-content");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>
      <div>
        <Label htmlFor="file">Select a file</Label>
        <div className="mt-1 flex items-center">
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("file")?.click()}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {file ? file.name : "Choose file"}
          </Button>
        </div>
      </div>
      <div>
        <Label>Select folder</Label>
        <FolderSelector onSelect={setSelectedFolder} />
      </div>
      <div>
        <Label>Permissions</Label>
        <PermissionSelector onSelect={setPermissions} />
      </div>
      <Button type="submit" className="w-full">
        Add Content
      </Button>
    </form>
  );
}
