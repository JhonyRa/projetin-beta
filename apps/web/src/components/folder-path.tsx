import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { EditFolderDialog } from './edit-folder-dialog'

export type FolderBreadcrumb = {
  id: string;
  name: string;
  description?: string;
}

interface FolderPathProps {
  path: FolderBreadcrumb[] | string[];
  isLoading?: boolean;
  showEditButton?: boolean;
  onFolderUpdated?: () => void;
}

export function FolderPath({ 
  path, 
  isLoading = false,
  showEditButton = false,
  onFolderUpdated
}: FolderPathProps) {
  // Check if path contains objects or strings
  const isStringPath = typeof path[0] === 'string';
  
  return (
    <nav aria-label="Folder path" className="flex items-center text-sm text-gray-500">
      <Link href="/dashboard" className="hover:text-gray-700 flex items-center">
        <Home className="h-4 w-4 mr-1" />
        Home
      </Link>
      
      {isLoading ? (
        <span className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-gray-400">Carregando...</span>
        </span>
      ) : (
        isStringPath ? (
          // Handle legacy string path format
          (path as string[]).map((folder, index) => (
            <span key={index} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-gray-700 font-medium">{folder}</span>
            </span>
          ))
        ) : (
          // Handle object-based folder breadcrumb
          (path as FolderBreadcrumb[]).map((folder, index) => (
            <span key={folder.id} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1" />
              {index === path.length - 1 ? (
                <span className="flex items-center">
                  <span className="text-gray-700 font-medium">{folder.name}</span>
                  {showEditButton && (
                    <EditFolderDialog
                      folder={{
                        id: folder.id,
                        name: folder.name,
                        description: folder.description ?? null,
                        displayOrder: 0
                      }}
                      onFolderUpdated={onFolderUpdated}
                    />
                  )}
                </span>
              ) : (
                <Link href={`/dashboard?folderId=${folder.id}`} className="hover:text-gray-700">
                  {folder.name}
                </Link>
              )}
            </span>
          ))
        )
      )}
    </nav>
  )
}

