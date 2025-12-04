import React, { useRef, useMemo, useCallback, useEffect } from 'react'
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

  const handleInsertTable = useCallback(() => {
    const quill = quillRef.current?.getEditor?.() ?? quillRef.current?.editor
    if (!quill) return
    const tableModule = quill.getModule('better-table')
    if (tableModule) {
      const rowsInput = prompt('Enter number of rows (default: 3):') || '3'
      const colsInput = prompt('Enter number of columns (default: 3):') || '3'
      const rows = parseInt(rowsInput, 10) || 3
      const cols = parseInt(colsInput, 10) || 3
      tableModule.insertTable(Math.max(1, rows), Math.max(1, cols))
    } else {
      console.error('Better-table module not found')
    }
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
      console.log('Drop event fired')
      if (!event.dataTransfer?.files) return
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        if (event.dataTransfer.files[i].type.startsWith('image/')) {
          console.log('Blocked image drop')
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

  console.log(value)

  return (
    <ReactQuill
      key={editorKey}
      theme='snow'
      value={value}
      onChange={onChange}
      modules={modules}
      className='h-96'
      ref={quillRef}
      placeholder='Enter content...'
    />
  )
}

export default FormInput