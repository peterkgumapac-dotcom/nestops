'use client'

import { useState } from 'react'

export interface StagedFile {
  id: string
  file: File
  preview?: string  // data URL for images
  progress: number  // 0-100
  error?: string
}

export function useFileUpload() {
  const [staged, setStaged] = useState<StagedFile[]>([])

  function addFiles(files: File[]) {
    const newStaged: StagedFile[] = files.map((file) => ({
      id: `${Date.now()}-${file.name}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0,
    }))
    setStaged((prev) => [...prev, ...newStaged])
  }

  function removeFile(id: string) {
    setStaged((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file?.preview) URL.revokeObjectURL(file.preview)
      return prev.filter((f) => f.id !== id)
    })
  }

  function setProgress(id: string, progress: number) {
    setStaged((prev) => prev.map((f) => (f.id === id ? { ...f, progress } : f)))
  }

  function setError(id: string, error: string) {
    setStaged((prev) => prev.map((f) => (f.id === id ? { ...f, error } : f)))
  }

  function clear() {
    staged.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview) })
    setStaged([])
  }

  return { staged, addFiles, removeFile, setProgress, setError, clear }
}
