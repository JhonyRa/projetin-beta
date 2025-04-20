import { baseApi } from '@/configs/axios';
import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';

import { VideoContentCard } from './video-content-card';

type Folder = {
  id: string
  name: string
  description: string | null
  displayOrder: number
  hasContent?: boolean // Whether the folder has any child folders or videos
}

type Video = {
  id: string
  title: string
  thumbnailUrl: string | null
  description: string | null
  displayOrder: number
  viewed: boolean
}

type ContentItem = {
  id: string
  title: string
  type: 'folder' | 'video'
  isEmpty?: boolean
  description?: string | null
  thumbnailUrl?: string | null
  displayOrder?: number | null
  viewed?: boolean
}

interface VideoContentGridProps {
  folderId?: string;
  refreshTrigger?: number; // A number that changes when content should be refreshed
}

export function VideoContentGrid({ folderId, refreshTrigger = 0 }: VideoContentGridProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [content, setContent] = useState<ContentItem[]>([])
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null)
  const [internalRefreshTrigger, setInternalRefreshTrigger] = useState(0)
  const { getToken } = useAuth()
  
  // Function to trigger a refresh from child components
  const handleContentDeleted = useCallback(() => {
    setInternalRefreshTrigger(prev => prev + 1);
  }, [])

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true)
      try {
        const token = await getToken()
        
        // If folderId is provided, fetch that folder's contents, otherwise fetch root folders
        const endpoint = folderId ? `/folders/${folderId}` : '/folders'
        const response = await baseApi.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        let contentItems: ContentItem[] = []
        
        if (folderId) {
          // When viewing a specific folder, store the current folder data
          const { id, name, description, hasContent, displayOrder, childFolders, videos } = response.data
          setCurrentFolder({ id, name, description, hasContent, displayOrder })
          
          // Convert folders to ContentItem format
          const folderItems: ContentItem[] = childFolders.map((folder: Folder) => ({
            id: folder.id,
            title: folder.name,
            type: 'folder',
            description: folder.description,
            displayOrder: folder.displayOrder,
            // A folder is empty if it has no child folders and no videos
            isEmpty: !folder.hasContent // We'll rely on the backend to tell us if the folder is empty
          }))
          
          // Convert videos to ContentItem format
          const videoItems: ContentItem[] = videos.map((video: Video) => ({
            id: video.id,
            title: video.title,
            type: 'video',
            description: video.description,
            thumbnailUrl: video.thumbnailUrl,
            displayOrder: video.displayOrder,
            viewed: video.viewed
          }))
          
          contentItems = [...folderItems, ...videoItems]
        } else {
          // When viewing root folders, clear the current folder
          setCurrentFolder(null)
          // When viewing root folders
          const folders: Folder[] = response.data
          contentItems = folders.map(folder => ({
            id: folder.id,
            title: folder.name,
            type: 'folder',
            description: folder.description,
            displayOrder: folder.displayOrder,
            isEmpty: !folder.hasContent // A folder is empty if it has no content
          }))
        }
        
        setContent(contentItems)
      } catch (error) {
        console.error('Error fetching content:', error)
        setContent([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchContent()
  }, [folderId, getToken, refreshTrigger, internalRefreshTrigger])

  const sortedContent = [...content].sort((a, b) => {
    // First sort by type: folders first, then videos
    if (a.type === 'folder' && b.type === 'video') return -1
    if (a.type === 'video' && b.type === 'folder') return 1
    
    // Then sort by displayOrder if both are the same type
    if (a.type === b.type) {
      // Convert to number and handle null/undefined values (treat as highest value)
      const orderA = a.displayOrder !== undefined && a.displayOrder !== null ? Number(a.displayOrder) : Infinity
      const orderB = b.displayOrder !== undefined && b.displayOrder !== null ? Number(b.displayOrder) : Infinity
      return orderA - orderB
    }
    
    return 0
  })

  if (isLoading) {
    return <div className="flex justify-center py-8">Carregando conteúdo...</div>
  }

  return (
    <div className="space-y-8">
      {/* Descrição da pasta atual */}
      {currentFolder?.description && (
        <div className="bg-gray-50 p-4 rounded-lg max-w-full overflow-hidden">
          <p className="text-sm text-gray-600 whitespace-pre-line break-words">{currentFolder.description}</p>
        </div>
      )}

      {sortedContent.length === 0 ? (
        <div className="text-center py-8">
          <div className="space-y-4 max-w-full overflow-hidden">
            <p>Nenhum conteúdo encontrado nesta pasta.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Seção de Pastas */}
          {sortedContent.some(item => item.type === 'folder') && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Pastas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedContent
                  .filter(item => item.type === 'folder')
                  .map((item) => (
                    <VideoContentCard 
                      key={item.id} 
                      {...item} 
                      onDelete={handleContentDeleted}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Seção de Vídeos */}
          {sortedContent.some(item => item.type === 'video') && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Vídeos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedContent
                  .filter(item => item.type === 'video')
                  .map((item) => (
                    <VideoContentCard 
                      key={item.id} 
                      {...item} 
                      onDelete={handleContentDeleted}
                    />
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}