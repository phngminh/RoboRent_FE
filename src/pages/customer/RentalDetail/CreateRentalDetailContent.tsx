import React, { useEffect, useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { getRobotTypesOfActivityAsync } from '../../../apis/robottypeofactivity.api'
import { createRentalDetailsBulkAsync, getRentalDetailsByRentalIdAsync, updateRentalDetailsAsync } from '../../../apis/rentaldetail.api'
import { getRoboTypesByIdsAsync } from '../../../apis/robotype.api'
import { customerSendRentalAsync } from '../../../apis/rental.customer.api'
import { useParams } from 'react-router-dom'

interface CreateRentalDetailContentProps {
  onBack: (rentalId: number) => void
  onSave: () => void
}

type DetailRow = {
  key: string
  id?: number
  roboTypeId: number
  roboTypeName?: string
  script: string
  branding: string
  scenario: string
  status?: string
  isDeleted?: boolean
}

const CreateRentalDetailContent: React.FC<CreateRentalDetailContentProps> = ({ onBack, onSave }) => {
  const { rentalId: rentalIdString } = useParams<{ rentalId: string }>()
  const rentalId = rentalIdString ? parseInt(rentalIdString, 10) : 0
  const { activityTypeId: activityTypeIdString } = useParams<{ activityTypeId: string }>()
  const activityTypeId = activityTypeIdString ? parseInt(activityTypeIdString, 10) : 0
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [rows, setRows] = useState<DetailRow[]>([])
  const [roboTypeNames, setRoboTypeNames] = useState<Record<number, string>>({})

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true)
      setErrors([])
      try {
        const existing = await getRentalDetailsByRentalIdAsync(rentalId)
        if (!mounted) return
        if (existing.success && existing.data.length > 0) {
          const loadedRows: DetailRow[] = existing.data.map(d => ({
            key: `${d.id}-${Math.random().toString(36).slice(2)}`,
            id: d.id,
            roboTypeId: d.roboTypeId,
            script: d.script,
            branding: d.branding,
            scenario: d.scenario,
            status: d.status,
            isDeleted: d.isDeleted,
          }))

          setRows(loadedRows)

          const uniqueIds = Array.from(new Set(existing.data.map(d => d.roboTypeId)))
          if (uniqueIds.length) {
            try {
              const infos = await getRoboTypesByIdsAsync(uniqueIds)
              const dict: Record<number, string> = {}
              infos.forEach(x => { dict[x.id] = x.name })
              setRoboTypeNames(dict)
            } catch {}
          }
          setLoading(false)
          return
        }

        const mapping = await getRobotTypesOfActivityAsync(activityTypeId)
        if (!mounted) return

        const newRows: DetailRow[] = []
        mapping.forEach(m => {
          const count = Math.max(1, m.amount ?? 1)
          for (let i = 0; i < count; i++) {
            newRows.push({
              key: `${m.roboTypeId}-${i}-${Math.random().toString(36).slice(2)}`,
              roboTypeId: m.roboTypeId,
              roboTypeName: m.roboTypeName,
              script: '',
              branding: '',
              scenario: '',
              status: 'Draft',
              isDeleted: false,
            })
          }
        })
        setRows(newRows)

        const uniqueIds = Array.from(new Set(mapping.map(m => m.roboTypeId)))
        if (uniqueIds.length) {
          try {
            const infos = await getRoboTypesByIdsAsync(uniqueIds)
            const dict: Record<number, string> = {}
            infos.forEach(x => { dict[x.id] = x.name })
            setRoboTypeNames(dict)
          } catch {}
        }
      } catch (e: any) {
        setErrors([e?.message || 'Failed to load rental details.'])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [rentalId, activityTypeId])


  const cardTitle = (row: DetailRow, indexWithinType: number) => {
    const nameFromMap = row.roboTypeName
    const fallbackName = roboTypeNames[row.roboTypeId]
    const name = nameFromMap || fallbackName || `Robot Type ${row.roboTypeId}`
    return `${name} (#${indexWithinType + 1})`
  }

  const indexWithinType = (rowIndex: number) => {
    const row = rows[rowIndex]
    const indices = rows
      .map((r, i) => ({ r, i }))
      .filter(x => x.r.roboTypeId === row.roboTypeId)
      .map(x => x.i)
    return indices.indexOf(rowIndex)
  }

  const handleChange = (key: string, field: keyof DetailRow, value: string | boolean) => {
    setRows(prev => prev.map(r => (r.key === key ? { ...r, [field]: value } : r)))
  }

  const handleSave = async () => {
    setErrors([])
    const isUpdate = rows.some(r => r.id !== undefined)

    try {
      setLoading(true)
      if (isUpdate) {
        const payload = rows.map(r => ({
          id: r.id!,
          rentalId,
          roboTypeId: r.roboTypeId,
          robotAbilityId: null,
          script: r.script?.trim() || '',
          branding: r.branding?.trim() || '',
          scenario: r.scenario?.trim() || '',
          status: r.status || 'Draft',
          isDeleted: r.isDeleted ?? false,
        }))

        const res = await updateRentalDetailsAsync(rentalId, payload)
        onSave()
      } else {
        const payload = rows.map(r => ({
          rentalId,
          roboTypeId: r.roboTypeId,
          robotAbilityId: null,
          script: r.script?.trim() || '',
          branding: r.branding?.trim() || '',
          scenario: r.scenario?.trim() || '',
          status: r.status || 'Draft',
          isDeleted: r.isDeleted ?? false,
        }))

        const res = await createRentalDetailsBulkAsync(payload)
        onSave()
      }

    } catch (err: any) {
      const beErrors = err?.response?.data?.errors
      if (Array.isArray(beErrors) && beErrors.length) {
        setErrors(beErrors)
      } else {
        setErrors(['Failed to save rental details.'])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    try {
      setLoading(true)
      setErrors([])

      // 🧩 Step 1: Save first
      await handleSave()

      // 🧩 Step 2: Then send rental
      await customerSendRentalAsync(rentalId)

      // 🧩 Step 3: Notify parent / move to next step
      onSave()
    } catch (err: any) {
      console.error('Error sending rental:', err)
      setErrors([err?.response?.data?.message || 'Failed to send rental.'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200 w-full'>
      <button
        onClick={() => onBack(rentalId)}
        className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-2'
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <h2 className='text-xl font-semibold text-gray-800 mb-2'>Create Rental Details</h2>
      <p className='text-sm text-gray-500 -mt-2 mb-2'>
        Provide customization for each required robot in this activity type.
      </p>

      {errors.length > 0 && (
        <div className='bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md'>
          <ul className='list-disc pl-5 space-y-1'>
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {loading && <div className='text-sm text-gray-500'>Loading...</div>}

      {!loading && rows.length === 0 && (
        <div className='text-sm text-gray-500'>
          No required robot types found for this activity type.
        </div>
      )}

      {/* Cards grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {rows.map((row, idx) => (
          <div key={row.key} className='border rounded-xl p-4 shadow-sm hover:shadow-md transition'>
            <div className='mb-3'>
              <div className='text-sm text-gray-500'>RoboType</div>
              <div className='text-base font-semibold text-gray-800'>
                {cardTitle(row, indexWithinType(idx))}
              </div>
            </div>

            {/* Script */}
            <div className='mb-3'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Script
              </label>
              <textarea
                value={row.script}
                onChange={(e) => handleChange(row.key, 'script', e.target.value)}
                className='w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 min-h-[72px]'
                placeholder='What the robot should say/do…'
              />
            </div>

            {/* Branding */}
            <div className='mb-3'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Branding
              </label>
              <input
                type='text'
                value={row.branding}
                onChange={(e) => handleChange(row.key, 'branding', e.target.value)}
                className='w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500'
                placeholder='Logos, stickers, colors…'
              />
            </div>

            {/* Scenario */}
            <div className='mb-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Scenario
              </label>
              <textarea
                value={row.scenario}
                onChange={(e) => handleChange(row.key, 'scenario', e.target.value)}
                className='w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 min-h-[72px]'
                placeholder='Where/when/how the robot participates…'
              />
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className='flex justify-end gap-3 pt-2'>
        <button
          onClick={handleSave}
          disabled={loading || rows.length === 0}
          className='px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm inline-flex items-center gap-2 disabled:opacity-60'
        >
          <Save size={16} />
          Save Details
        </button>
        <button
          className='px-4 py-2 rounded-md border hover:bg-gray-100 text-sm inline-flex items-center gap-2'
          disabled={loading || rows.length === 0}
          onClick={handleSend}
        >
          Send
        </button>

      </div>
    </div>
  )
}

export default CreateRentalDetailContent