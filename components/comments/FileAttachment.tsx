'use client'

interface Attachment {
  id: string
  file_name: string
  file_size?: number
  file_type?: string
  storage_path: string
}

interface Props {
  attachments: Attachment[]
}

// TODO: Step 14 implementation
export function FileAttachment({ attachments }: Props) {
  return <div data-slot="file-attachment" />
}
