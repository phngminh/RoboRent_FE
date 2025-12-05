import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import Quill from 'quill'
import QuillBetterTable from 'quill-better-table'

Quill.register({ 'modules/better-table': QuillBetterTable }, true)

interface FormInputProps {
  value: string
  onChange: (content: string) => void
  editorKey?: string | number
}

const FormInput: React.FC<FormInputProps> = ({ value, onChange, editorKey }) => {
  const quillRef = useRef<any>(null)
  const [showTableModal, setShowTableModal] = useState(false)
  const [hoveredRows, setHoveredRows] = useState(2)
  const [hoveredCols, setHoveredCols] = useState(3)

  const maxGridRows = 8
  const maxGridCols = 10

  const handleInsertTable = useCallback(() => {
    setShowTableModal(true)
    setHoveredRows(2)
    setHoveredCols(3)
  }, [])

  const handleTableInsert = useCallback((rows: number, cols: number) => {
    const quill = quillRef.current?.getEditor?.() ?? quillRef.current?.editor
    if (!quill) return
    const tableModule = quill.getModule('better-table')
    if (tableModule) {
      tableModule.insertTable(Math.max(1, rows), Math.max(1, cols))
    } else {
      console.error('Better-table module not found')
    }
    setShowTableModal(false)
  }, [])

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['table'],
        ['clean']
      ],
      handlers: {
        table: function(this: any) {
          handleInsertTable()
        }
      }
    },
    'better-table': {
      operationMenu: {
        items: {
          unmergeCells: true,
          insertRowAbove: true,
          insertRowBelow: true,
          insertColumnLeft: true,
          insertColumnRight: true,
          deleteRow: true,
          deleteColumn: true,
        }
      },
      tableCellStyles: {
        classNames: ['contract-highlight', 'contract-bold']
      }
    },
    keyboard: {
      bindings: QuillBetterTable.keyboardBindings
    },
    clipboard: {
      matchers: [],
      matchVisual: true
    }
  }), [handleInsertTable])

  useEffect(() => {
    const quill = quillRef.current?.getEditor?.() ?? quillRef.current?.editor
    if (!quill) return

    quill.on('text-change', () => {
    const tables = quill.root.querySelectorAll('table.quill-better-table')
      tables.forEach((table: HTMLTableElement) => {
        table.style.width = ''
        table.style.tableLayout = 'fixed'

        const tds = table.querySelectorAll('td, th') as NodeListOf<HTMLElement>
        tds.forEach((cell) => {
          cell.style.width = ''
        })
      })
    })

    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          event.preventDefault()
          event.stopPropagation()
          return
        }
      }

      const html = event.clipboardData?.getData('text/html') || ''
      if (html.includes('<img')) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
    }

    const handleDrop = (event: DragEvent) => {
      if (!event.dataTransfer?.files) return
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        if (event.dataTransfer.files[i].type.startsWith('image/')) {
          event.preventDefault()
          event.stopPropagation()
          return
        }
      }
    }

    const handleDragOver = (event: DragEvent) => {
      if (!event.dataTransfer?.files) return
      let hasImage = false
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        if (event.dataTransfer.files[i].type.startsWith('image/')) {
          hasImage = true
          break
        }
      }
      if (hasImage) {
        event.preventDefault()
        return
      }
      event.preventDefault()
    }

    quill.root.addEventListener('paste', handlePaste, true)
    quill.root.addEventListener('drop', handleDrop, true)
    quill.root.addEventListener('dragover', handleDragOver, true)

    return () => {
      quill.root.removeEventListener('paste', handlePaste, true)
      quill.root.removeEventListener('drop', handleDrop, true)
      quill.root.removeEventListener('dragover', handleDragOver, true)
    }
  }, [])

  return (
    <div className='relative h-[250px] overflow-hidden'>
      <ReactQuill
        key={editorKey}
        theme='snow'
        value={value}
        onChange={onChange}
        modules={modules}
        className='h-full'
        ref={quillRef}
        placeholder='Enter content...'
      />
      {showTableModal && (
        <div
          className='fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center'
          onClick={() => setShowTableModal(false)}
        >
          <div
            className='bg-white p-6 rounded-xl shadow-xl min-w-[300px] text-center animate-[fadeIn_0.15s_ease]'
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className='text-lg font-semibold mb-4'>Insert Table</h3>

            <div className='inline-block bg-gray-200 p-2 rounded-md mb-3'>
              <div
                className='grid gap-1 bg-gray-300 p-1 rounded'
                style={{
                  gridTemplateColumns: `repeat(${maxGridCols}, 18px)`,
                  gridTemplateRows: `repeat(${maxGridRows}, 18px)`
                }}
              >
                {Array.from({ length: maxGridRows }).map((_, rowIndex) =>
                  Array.from({ length: maxGridCols }).map((_, colIndex) => {
                    const isSelected = rowIndex < hoveredRows && colIndex < hoveredCols
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`w-[18px] h-[18px] bg-white border
                          ${isSelected ? 'border-orange-500' : 'border-gray-300'}
                          cursor-pointer transition-colors duration-75`}
                        onMouseEnter={() => {
                          setHoveredRows(rowIndex + 1)
                          setHoveredCols(colIndex + 1)
                        }}
                        onClick={() => handleTableInsert(rowIndex + 1, colIndex + 1)}
                      />
                    )
                  })
                )}
              </div>
            </div>

            <p className='text-sm text-gray-600'>
              {hoveredRows} rows × {hoveredCols} columns
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default FormInput