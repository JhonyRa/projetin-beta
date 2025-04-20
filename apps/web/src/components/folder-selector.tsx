"use client"

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandLoading,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { baseApi } from "@/configs/axios"
import { useAuth } from "@clerk/nextjs"

export type Folder = {
  id: string
  name: string
  description?: string | null
  fatherFolderId?: string | null
}

interface FolderSelectorProps {
  onSelect: (folder: Folder) => void
  initialFolder?: Folder
  excludeFolderId?: string
}

export function FolderSelector({ onSelect, initialFolder, excludeFolderId }: FolderSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(initialFolder || null)
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { getToken } = useAuth()

  useEffect(() => {
    async function fetchFolders() {
      if (!open) return
      
      setIsLoading(true)
      try {
        // Use Clerk's getToken
        let token;
        try {
          token = await getToken();
        } catch (authError) {
          console.error('Authentication error:', authError);
          throw new Error('Failed to get authentication token');
        }
        
        const response = await baseApi.get('/folders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        let fetchedFolders = response.data
        
        // Add a "Root" option
        const rootFolder = { id: 'root', name: 'Root' }
        
        // If we need to exclude a folder (e.g., current folder when selecting a parent)
        if (excludeFolderId) {
          fetchedFolders = fetchedFolders.filter((folder: Folder) => folder.id !== excludeFolderId)
        }
        
        setFolders([rootFolder, ...fetchedFolders])
      } catch (error) {
        console.error('Error fetching folders:', error)
        setFolders([{ id: 'root', name: 'Root' }])
      } finally {
        setIsLoading(false)
      }
    }

    fetchFolders()
  }, [open, getToken, excludeFolderId])

  const handleSelect = (folder: Folder) => {
    setSelectedFolder(folder)
    onSelect(folder)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedFolder ? selectedFolder.name : "Select folder"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search folders..." />
          {isLoading ? (
            <CommandLoading>Loading folders...</CommandLoading>
          ) : (
            <>
              <CommandEmpty>No folder found.</CommandEmpty>
              <CommandGroup>
                {folders.map((folder) => (
                  <CommandItem
                    key={folder.id}
                    onSelect={() => handleSelect(folder)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedFolder?.id === folder.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {folder.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

