import React, { useEffect, useState } from 'react'
import { ArrowLeft, Save, Bot } from 'lucide-react'
import { getRobotTypesOfActivityAsync } from '../../../apis/robottypeofactivity.api'
import { createRentalDetailsBulkAsync, getRentalDetailsByRentalIdAsync, updateRentalDetailsAsync } from '../../../apis/rentaldetail.api'
import { getRoboTypesByIdsAsync } from '../../../apis/robotype.api'
import { customerSendRentalAsync } from '../../../apis/rental.customer.api'
import { useParams } from 'react-router-dom'
import Layout from '../../../components/layout'

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

  const validateBeforeSend = () => {
    const missing: string[] = []

    rows.forEach((r, idx) => {
      const label = cardTitle(r, indexWithinType(idx))

      if (!r.script.trim()) missing.push(`${label}: Script is required.`)
      if (!r.branding.trim()) missing.push(`${label}: Branding is required.`)
      if (!r.scenario.trim()) missing.push(`${label}: Scenario is required.`)
    })

    if (missing.length > 0) {
      setErrors(missing)
      return false
    }

    return true
  }

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

  const handleSave = async (shouldTriggerOnSave = true) => {
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

        await updateRentalDetailsAsync(rentalId, payload)
        if (shouldTriggerOnSave) onSave()

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

        await createRentalDetailsBulkAsync(payload)
        if (shouldTriggerOnSave) onSave()
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
    setErrors([])

    // ⛔ Validate ONLY for Send
    if (!validateBeforeSend()) {
      return // stop sending
    }

    try {
      setLoading(true)

      // Save without triggering parent refresh
      await handleSave(false)

      // Send to manager
      await customerSendRentalAsync(rentalId)

      // After sending → refresh list
      onSave()
    } catch (err: any) {
      console.error('Error sending rental:', err)
      setErrors([err?.response?.data?.message || 'Failed to send rental.'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className='fixed inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 -z-10' />
      <div className='max-w-5xl mx-auto my-8 relative z-10 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 w-full bg-white'>
        <button
          onClick={() => onBack(rentalId)}
          className='flex items-center gap-3 text-base text-gray-600 hover:text-purple-600 mb-4 transition-colors duration-200'
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <h2 className='text-3xl font-bold text-center mb-2 text-gray-800 bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent'>
          Create Rental Details
        </h2>
        <p className='text-sm text-gray-500 mb-8 text-center'>
          Provide customization for each required robot in this activity type.
        </p>

        {errors.length > 0 && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mt-6 mb-2 shadow-sm'>
            <p className='font-semibold mb-3 text-red-800'>Please fix the following issues:</p>
            <div className='space-y-1 text-sm'>
              {errors.map((e, i) => (
                <p key={i} className='ml-4'>• {e}</p>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className='bg-white border border-gray-200 text-gray-500 px-6 py-4 rounded-xl text-sm text-center'>
            Loading...
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className='bg-white border border-gray-200 text-gray-500 px-6 py-4 rounded-xl text-sm text-center'>
            No required robot types found for this activity type.
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div className='p-8 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-6'>
            <div className='flex items-center gap-3'>
              <Bot className='text-purple-600' size={24} />
              <h3 className='font-bold text-xl text-gray-800'>Robot Customizations</h3>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {rows.map((row, idx) => (
                <div key={row.key} className='border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 bg-white'>
                  <div className='mb-4'>
                    <div className='text-sm text-gray-500 mb-1'>RoboType</div>
                    <div className='text-base font-semibold text-gray-800'>
                      {cardTitle(row, indexWithinType(idx))}
                    </div>
                  </div>

                  <div className='mb-4'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Script
                    </label>
                    <textarea
                      value={row.script}
                      onChange={(e) => handleChange(row.key, 'script', e.target.value)}
                      className='w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-[100px] resize-vertical'
                      placeholder='What the robot should say/do…'
                    />
                  </div>

                  <div className='mb-4'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Branding
                    </label>
                    <input
                      type='text'
                      value={row.branding}
                      onChange={(e) => handleChange(row.key, 'branding', e.target.value)}
                      className='w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200'
                      placeholder='Logos, stickers, colors…'
                    />
                  </div>

                  <div className='mb-1'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Scenario
                    </label>
                    <textarea
                      value={row.scenario}
                      onChange={(e) => handleChange(row.key, 'scenario', e.target.value)}
                      className='w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-[100px] resize-vertical'
                      placeholder='Where/when/how the robot participates…'
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className='flex flex-col sm:flex-row justify-end gap-4 pt-6'>
          <button
            onClick={() => handleSave()}
            disabled={loading || rows.length === 0}
            className='px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2'
          >
            <Save size={16} />
            Save Details
          </button>
          <button
            className='px-6 py-3 rounded-xl border border-purple-300 text-purple-700 hover:bg-purple-50 text-sm font-medium transition-all duration-200 inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed'
            disabled={loading || rows.length === 0}
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default CreateRentalDetailContent