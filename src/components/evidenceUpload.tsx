import { useState } from 'react'
import { Upload } from 'lucide-react'
import { toast } from 'react-toastify'

interface CloudinaryUploadResponse {
  event: string
  info: {
    secure_url: string
    public_id: string
    format: string
    resource_type: string
    created_at: string
    bytes: number
    duration?: number
    width?: number
    height?: number
  }
}

interface EvidenceUploadButtonProps {
  onUploadSuccess: (data: { url: string; publicId: string }) => void
  rentalId: number
}

declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (
        options: any,
        callback: (error: any, result: CloudinaryUploadResponse) => void
      ) => {
        open: () => void
        close: () => void
      }
    }
  }
}

export default function EvidenceUploadButton({ onUploadSuccess, rentalId }: EvidenceUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = () => {
    if (typeof window.cloudinary === 'undefined') {
      toast.error('Cloudinary widget not loaded. Please refresh the page.')
      return
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      toast.error('Cloudinary configuration missing')
      console.error('Missing VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET')
      return
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        sources: ['local', 'url'],
        multiple: false,
        resourceType: 'auto',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'],
        maxFileSize: 50000000,
        folder: `evidence/rental_${rentalId}`,
        cropping: false,
        showSkipCropButton: true,
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#E5E7EB',
            tabIcon: '#2563EB',
            menuIcons: '#374151',
            textDark: '#111827',
            textLight: '#FFFFFF',
            link: '#2563EB',
            action: '#2563EB',
            inactiveTabIcon: '#9CA3AF',
            error: '#EF4444',
            inProgress: '#2563EB',
            complete: '#10B981',
            sourceBg: '#F9FAFB'
          },
          fonts: {
            default: null,
            "'Inter', sans-serif": {
              url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
              active: true
            }
          }
        },
        text: {
          en: {
            or: 'Or',
            back: 'Back',
            close: 'Close',
            menu: {
              files: 'My Files',
              web: 'Web Address'
            },
            local: {
              browse: 'Browse',
              dd_title_single: 'Drag and Drop your file here',
              dd_title_multi: 'Drag and Drop files here',
              drop_title_single: 'Drop your file to upload',
              drop_title_multiple: 'Drop files to upload'
            },
            queue: {
              title: 'Upload Queue',
              title_uploading_with_counter: 'Uploading {{num}} File',
              title_processing_with_counter: 'Processing {{num}} File',
              abort_all: 'Abort all',
              done: 'Done'
            }
          }
        }
      },
      (error, result: CloudinaryUploadResponse) => {
        if (error) {
          console.error('Cloudinary upload error:', error)
          toast.error('Failed to upload evidence')
          setIsUploading(false)
          return
        }

        if (result.event === 'success') {
          const data = {
            url: result.info.secure_url,
            publicId: result.info.public_id
          }
          
          onUploadSuccess(data)
          setIsUploading(false)
          widget.close()
        }

        if (result.event === 'queues-end') {
          setIsUploading(false)
        }

        if (result.event === 'upload-added') {
          setIsUploading(true)
          toast.info('Uploading evidence...')
        }
      }
    )

    widget.open()
  }

  return (
    <div className="relative group">
      <button
        onClick={handleUpload}
        disabled={isUploading}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm w-full justify-center ${
          isUploading
            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-900'
        }`}
      >
        {isUploading ? (
          <>
            <Upload size={16} className="text-gray-400 animate-pulse" />
            Uploading...
          </>
        ) : (
          <>
            <Upload size={16} className="text-blue-600" />
            Upload Evidence
          </>
        )}
      </button>
    </div>
  )
}