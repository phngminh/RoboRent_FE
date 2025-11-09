// src/components/chat/DemoUploadButton.tsx
import { useState } from 'react'
import { Video, Upload } from 'lucide-react'
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

interface DemoUploadButtonProps {
  onUploadSuccess: (videoData: { url: string; publicId: string }) => void
  rentalId: number
  disabled?: boolean
  disabledReason?: string
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

export default function DemoUploadButton({ 
  onUploadSuccess, 
  rentalId,
  disabled = false,
  disabledReason = 'This action is not available yet'
}: DemoUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = () => {
    if (disabled) return

    // Check if Cloudinary script is loaded
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
        sources: ['local', 'url', 'camera'],
        multiple: false,
        resourceType: 'video',
        clientAllowedFormats: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'],
        maxFileSize: 100000000, // 100MB
        maxVideoFileSize: 100000000,
        folder: `demos/rental_${rentalId}`,
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
              web: 'Web Address',
              camera: 'Camera'
            },
            local: {
              browse: 'Browse',
              dd_title_single: 'Drag and Drop your video here',
              dd_title_multi: 'Drag and Drop videos here',
              drop_title_single: 'Drop your video to upload',
              drop_title_multiple: 'Drop videos to upload'
            },
            queue: {
              title: 'Upload Queue',
              title_uploading_with_counter: 'Uploading {{num}} Video',
              title_processing_with_counter: 'Processing {{num}} Video',
              abort_all: 'Abort all',
              done: 'Done'
            }
          }
        }
      },
      (error, result: CloudinaryUploadResponse) => {
        if (error) {
          console.error('Cloudinary upload error:', error)
          toast.error('Failed to upload video')
          setIsUploading(false)
          return
        }

        if (result.event === 'success') {
          const videoData = {
            url: result.info.secure_url,
            publicId: result.info.public_id
          }
          
          console.log('✅ Video uploaded:', videoData)
          toast.success('Video uploaded successfully!')
          
          onUploadSuccess(videoData)
          setIsUploading(false)
          widget.close()
        }

        if (result.event === 'queues-end') {
          setIsUploading(false)
        }

        if (result.event === 'upload-added') {
          setIsUploading(true)
          toast.info('Uploading video...')
        }
      }
    )

    widget.open()
  }

  return (
    <div className="relative group">
      <button
        onClick={handleUpload}
        disabled={disabled || isUploading}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm ${
          disabled || isUploading
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
            <Video size={16} className={disabled ? 'text-gray-400' : 'text-blue-600'} />
            Send Demo
          </>
        )}
      </button>

      {/* Tooltip */}
      {disabled && !isUploading && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {disabledReason}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  )
}