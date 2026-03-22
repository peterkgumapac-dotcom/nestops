import { getSupabaseBrowserClient } from './client'

type Bucket = 'task-media' | 'task-documents' | 'comment-attachments'

/** Compress an image client-side before upload */
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 1920
      let { width, height } = img
      if (width > MAX) {
        height = Math.round((height * MAX) / width)
        width = MAX
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (!blob) { resolve(file); return }
          resolve(new File([blob], file.name, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        0.82
      )
    }
    img.src = url
  })
}

export async function uploadTaskPhoto(
  taskId: string,
  slot: 'before' | 'after',
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const supabase = getSupabaseBrowserClient()
  const compressed = await compressImage(file)
  const path = `tasks/${taskId}/${slot}/${Date.now()}-${compressed.name}`
  const { error } = await supabase.storage
    .from('task-media')
    .upload(path, compressed, { upsert: false })
  if (error) throw error
  onProgress?.(100)
  return path
}

export async function uploadCommentAttachment(
  commentId: string,
  file: File
): Promise<string> {
  const supabase = getSupabaseBrowserClient()
  const isImage = file.type.startsWith('image/')
  const processed = isImage ? await compressImage(file) : file
  const path = `comments/${commentId}/${Date.now()}-${file.name}`
  const { error } = await supabase.storage
    .from('comment-attachments')
    .upload(path, processed, { upsert: false })
  if (error) throw error
  return path
}

export async function getSignedUrl(bucket: Bucket, path: string, expiresIn = 3600) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}
