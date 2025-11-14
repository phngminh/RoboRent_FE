import React, { useEffect, useState } from 'react'
import { getAllEventActivityAsync } from '../../../apis/eventactivity.api'
import { getActivityTypeByEAIdAsync } from '../../../apis/activitytype.api'
import { getAllProvincesAsync, getAllWardsAsync } from '../../../apis/address.api'
import { ArrowLeft } from 'lucide-react'
import { customerCreateRentalAsync, customerUpdateRentalAsync, getRentalByIdAsync } from '../../../apis/rental.customer.api'
import TimePicker from 'react-time-picker'
import 'react-time-picker/dist/TimePicker.css'
import 'react-clock/dist/Clock.css'
import { useAuth } from '../../../contexts/AuthContext'

interface EventActivity {
  id: number
  name: string
  description: string
  isDeleted: boolean
}

interface ActivityType {
  id: number
  eventActivityId: number
  name: string
  isDeleted: boolean
}

interface Provinces {
  name: string
  code: number
  division_type: string
  codename: string
  phone_code: number
}

interface Wards {
  name: string
  code: number
  division_type: string
  codename: string
  province_code: number
}

interface CreateRentalRequestContentProps {
  onBack: () => void
  onNextStep: (rentalId: number, activityTypeId: number) => void
  rentalId?: number
}

const CreateRentalRequestContent: React.FC<CreateRentalRequestContentProps> = ({ onBack, onNextStep, rentalId }) => {
  const { user } = useAuth()
  const [eventDate, setEventDate] = useState<string>('')
  const [errors, setErrors] = useState<string[]>([])

  const [eventActivities, setEventActivities] = useState<EventActivity[]>([])
  const [selectedActivityId, setSelectedActivityId] = useState<number | ''>('')

  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([])
  const [selectedTypeId, setSelectedTypeId] = useState<number | ''>('')

  const [provinces, setProvinces] = useState<Provinces[]>([])
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | ''>('')

  const [wards, setWards] = useState<Wards[]>([])
  const [selectedWardId, setSelectedWardId] = useState<number | ''>('')

  const [eventName, setEventName] = useState('')
  const [description, setDescription] = useState('')

  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')

  const [streetAddress, setStreetAddress] = useState('')

  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const buildFullAddress = () => {
    const ward = wards.find(w => w.code === selectedWardId)?.name || ''
    return `${streetAddress}${ward ? `, ${ward}` : ''}`
  }
  
  const parseAddress = (addr?: string) => {
    if (!addr) return { street: '', wardName: ''
    }
    const parts = addr.split(',').map(s => s.trim()).filter(Boolean)
    if (parts.length <= 1) return { street: addr.trim(), wardName: ''}
    const wardName = parts[parts.length - 1]
    const street = parts.slice(0, -1).join(', ')
    return { street, wardName }
  }

  const validateRequired = () => {
    const errs: string[] = []
    if (!eventName.trim()) errs.push('Event Name is required.')
    if (!selectedActivityId) errs.push('Event Activity is required.')
    if (!selectedTypeId) errs.push('Activity Type is required.')
    if (!phoneNumber.trim()) errs.push('Phone Number is required.')
    if (!email.trim()) errs.push('Email Address is required.')
    if (!streetAddress.trim()) errs.push('Street & House Number is required.')
    if (!selectedProvinceId) errs.push('Province / City is required.')
    if (!selectedWardId) errs.push('Ward is required.')
    if (!eventDate) errs.push('Event Date is required.')
    if (!startTime) errs.push('Start Time is required.')
    if (!endTime) errs.push('End Time is required.')
    setErrors(errs)
    return errs.length === 0
  }

  const handleSaveDraft = async () => {
    if (!validateRequired()) {
      return
    }

    const body: any = {
      id: rentalId,
      eventName,
      phoneNumber,
      email,
      description,
      address: buildFullAddress(),
      city: provinces.find(p => p.code === selectedProvinceId)?.name || '',
      startTime,
      endTime,
      eventDate: eventDate ? new Date(eventDate).toISOString() : null,
      updatedDate: new Date().toISOString(),
      status:'Draft',
      accountId: user?.userId,
      eventActivityId: selectedActivityId,
      activityTypeId: selectedTypeId,
    }

    if (!rentalId) {
      body.createdDate = new Date().toISOString()
      body.requestedDate = new Date().toISOString()
      body.isDeleted = false
    }

    try {
      let res
      if (rentalId) {
        res = await customerUpdateRentalAsync(body)
      } else {
        res = await customerCreateRentalAsync(body)
      }

      if (res?.success === false && res?.errors?.length > 0) {
        setErrors(res.errors)
        return
      }

      alert(rentalId ? 'Draft updated successfully!' : 'Draft created successfully!')
      setErrors([])
      return res?.id ?? rentalId

    } catch (err: any) {
      const beErrors = err.response?.data?.errors
      if (Array.isArray(beErrors)) {
        setErrors(beErrors)
      } else {
        setErrors(['Something went wrong. Please try again.'])
      }
      console.error(err)
    }
  }


  const handleNextStepClick = async () => {
    const id = await handleSaveDraft()
    if (!id) return
    onNextStep(id, Number(selectedTypeId))
  }

  useEffect(() => {
    (async () => {
      const res = await getAllEventActivityAsync()
      setEventActivities(res || [])
    })()
  }, [])

  useEffect(() => {
    (async () => {
      const res = await getAllProvincesAsync()
      setProvinces(res || [])
    })()
  }, [])

  useEffect(() => {
    if (!selectedActivityId) {
      setActivityTypes([])
      setSelectedTypeId('')
      return
    }
    (async () => {
      const res = await getActivityTypeByEAIdAsync(Number(selectedActivityId))
      setActivityTypes(res || [])
      if (!res?.some((x: ActivityType) => x.id === selectedTypeId)) {
        setSelectedTypeId('')
      }
    })()
  }, [selectedActivityId])

  useEffect(() => {
    if (!selectedProvinceId) {
      setWards([])
      setSelectedWardId('')
      return
    }
    (async () => {
      const res = await getAllWardsAsync()
      setWards(res || [])
      if (selectedWardId && !res?.some((w: Wards) => w.code === selectedWardId && w.province_code === selectedProvinceId)) {
        setSelectedWardId('')
      }
    })()
  }, [selectedProvinceId])

  useEffect(() => {
    if (!rentalId) return
    (async () => {
      try {
        const r = await getRentalByIdAsync(rentalId)

        setEventName(r.eventName ?? '')
        setPhoneNumber(r.phoneNumber ?? '')
        setEmail(r.email ?? '')
        setDescription(r.description ?? '')

        setEventDate(r.eventDate ? String(r.eventDate).slice(0, 10) : '')

        setStartTime((r.startTime || '').slice(0, 5))
        setEndTime((r.endTime || '').slice(0, 5))

        const { street, wardName } = parseAddress(r.address)
        setStreetAddress(street)

        setSelectedActivityId(r.eventActivityId ?? '')
        setSelectedTypeId(r.activityTypeId ?? '')

        if (r.city) {
          let provinceList = provinces
          if (provinceList.length === 0) {
            provinceList = (await getAllProvincesAsync()) || []
            setProvinces(provinceList)
          }
          const province = provinceList.find((p: Provinces) => p.name === r.city)
          if (province) {
            setSelectedProvinceId(province.code)
            let wardList = wards
            if (wardList.length === 0) {
              wardList = (await getAllWardsAsync()) || []
              setWards(wardList)
            }

            if (wardName) {
              const matchedWard = wardList.find(
                (w: Wards) => w.province_code === province.code && w.name === wardName
              )
              if (matchedWard) setSelectedWardId(matchedWard.code)
            }
          }
        }
      } catch (e) {
        console.error('Failed to load rental by id', e)
      }
    })()
  }, [rentalId, provinces.length])

  return (
    <div className='space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200 w-full'>
      <button
        onClick={onBack}
        className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-2'
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <h2 className='text-xl font-semibold text-gray-800 mb-2'>
        {rentalId ? 'Edit Rental Request' : 'Create Rental Request'}
      </h2>

      {/* Event Information */}
      <div className='p-5 border border-purple-300 rounded-lg space-y-4'>
        <div>
          <h3 className='font-semibold text-gray-800'>Event Information</h3>
          <p className='text-sm text-gray-500'>Provide the main details about your event.</p>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Event Name <span className='text-red-500'>*</span>
            </label>
            <input
              required
              type='text'
              placeholder='Enter event name'
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className='w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Event Activity <span className='text-red-500'>*</span>
            </label>
            <select
              required
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(Number(e.target.value) || '')}
              className='w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Select activity...</option>
              {eventActivities.map((ea) => (
                <option key={ea.id} value={ea.id}>
                  {ea.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Activity Type <span className='text-red-500'>*</span>
            </label>
            <select
              required
              value={selectedTypeId}
              onChange={(at) => setSelectedTypeId(Number(at.target.value) || '')}
              disabled={!selectedActivityId}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${!selectedActivityId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value=''>Select type...</option>
              {activityTypes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Event Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Describe your event...'
            className='w-full border rounded-md px-3 py-2 text-sm min-h-[70px] focus:ring-2 focus:ring-blue-500'
          ></textarea>
        </div>
      </div>

      {/* Contact Information */}
      <div className='p-5 border border-gray-200 rounded-lg space-y-4'>
        <div>
          <h3 className='font-semibold text-gray-800'>Contact Information</h3>
          <p className='text-sm text-gray-500'>How we can reach you for this request.</p>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Phone Number <span className='text-red-500'>*</span>
            </label>
            <input
              required
              type='text'
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder='e.g. 0912345678'
              className='w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Email Address <span className='text-red-500'>*</span>
            </label>
            <input
              required
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='e.g. example@mail.com'
              className='w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>
      </div>

      {/* Event Location */}
      <div className='p-5 border border-gray-200 rounded-lg space-y-4'>
        <div>
          <h3 className='font-semibold text-gray-800'>Event Location</h3>
          <p className='text-sm text-gray-500'>Where the event will take place.</p>
        </div>

        {/* Street & House Number */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Street & House Number <span className='text-red-500'>*</span>
          </label>
          <input
            required
            type='text'
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            placeholder='e.g. 600 Trường Sa'
            className='w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          {/* Province */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Province / City <span className='text-red-500'>*</span>
            </label>
            <select
              required
              value={selectedProvinceId}
              onChange={(pi) => setSelectedProvinceId(Number(pi.target.value) || '')}
              className='w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Select Province</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ward */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Ward <span className='text-red-500'>*</span>
            </label>
            <select
              required
              value={selectedWardId}
              onChange={(wi) => setSelectedWardId(Number(wi.target.value) || '')}
              disabled={!selectedProvinceId}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${!selectedProvinceId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value=''>Select Ward</option>
              {wards
                .filter(w => w.province_code === selectedProvinceId)
                .map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Event Time */}
      <div className='p-5 border border-gray-200 rounded-lg space-y-4'>
        <div>
          <h3 className='font-semibold text-gray-800'>Event Time</h3>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Event Date <span className='text-red-500'>*</span>
          </label>
          <input
            required
            type='date'
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className='w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Start Time <span className='text-red-500'>*</span>
            </label>
            <TimePicker
              onChange={(value) => setStartTime(value || '')}
              value={startTime}
              disableClock={true}
              clearIcon={null}
              format='HH:mm'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              End Time <span className='text-red-500'>*</span>
            </label>
            <TimePicker
              onChange={(value) => setEndTime(value || '')}
              value={endTime}
              disableClock={true}
              clearIcon={null}
              format='HH:mm'
            />
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className='bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md'>
          <ul className='list-disc pl-5 space-y-1'>
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className='flex justify-end gap-3 pt-2'>
        <button
          onClick={() => {
            handleSaveDraft()
            onBack()
          }}
          className='px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 text-sm'
        >
          Save as Draft
        </button>

        <button
          onClick={handleNextStepClick}
          className='px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm'
        >
          Customize Robot
        </button>
      </div>
    </div>
  )
}

export default CreateRentalRequestContent