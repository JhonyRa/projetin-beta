import { useUser } from '@/contexts/user-context';
import { Calendar, Edit, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useFolderPermission } from '@/hooks/use-folder-permission';

interface VideoDetailsProps {
  video: {
    id: string
    title: string
    description: string
    uploadDate: string
    folderPath: string[]
    folderId?: string
    viewed: boolean
    views: number
  }
  showEditButton?: boolean
}

export function VideoDetails({ video, showEditButton = true }: VideoDetailsProps) {
  const { role, isLoading: isLoadingUser } = useUser();
  const { hasPermission } = useFolderPermission(video.folderId);
  const isAdmin = role === "Admin";
  const isGlobalEditor = role === "Global Editor";
  const canEdit = !isLoadingUser && (isAdmin || isGlobalEditor || hasPermission);

  return (
    <div className="space-y-4 max-w-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold break-words max-w-[calc(100%-120px)]">{video.title}</h1>
        {showEditButton && canEdit && (
          <Link href={`/video/${video.id}/edit`} className="flex-shrink-0">
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
        )}
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-500 flex-wrap">
        <span className="flex items-center">
          <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
          {video.uploadDate}
        </span>
        {video.viewed && (
          <span className="flex items-center text-green-500">
            <Check className="w-4 h-4 mr-1 flex-shrink-0" />
            Visualizado
          </span>
        )}
      </div>
      <div className="prose max-w-full">
        <p className="text-gray-700 break-words whitespace-pre-line">{video.description}</p>
      </div>
    </div>
  );
}

