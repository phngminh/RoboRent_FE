import React, { useEffect, useState, useMemo } from 'react'
import { getActivityTypeByEAIdAsync } from '../../../apis/activitytype.api'
import { getAllProvincesAsync, getAllWardsAsync } from '../../../apis/address.api'
import { customerCreateRentalAsync, customerUpdateRentalAsync, getRentalByIdAsync } from '../../../apis/rental.customer.api'
import 'react-time-picker/dist/TimePicker.css'
import 'react-clock/dist/Clock.css'
import { useAuth } from '../../../contexts/AuthContext'
import { ArrowLeft, MapPin, Clock, Home, CalendarDays } from 'lucide-react'
import BlockTimePicker from '../../../components/customer/BlockTimePicker'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useParams } from 'react-router-dom'
import { getProfile } from '../../../apis/auth.api'
import Select, { type SingleValue } from 'react-select'

interface ActivityType {
  id: number
  code: string
  name: string
  shortDescription: string
  description: string
  price: number
  currency: string
  includesOperator: boolean
  operatorCount: number
  hourlyRate: number
  minimumMinutes: number
  billingIncrementMinutes: number
  technicalStaffFeePerHour: number
  isActive: boolean
  isDeleted: boolean
}

interface Provinces {
  name: string
  code: number
}

interface Wards {
  name: string
  code: number
  province_code: number
}

interface Option {
  value: number
  label: string
}

interface CreateRentalRequestContentProps {
  onBack: () => void
  onNextStep: (rentalId: number, activityTypeId: number) => void
}

const CreateRentalRequestContent: React.FC<CreateRentalRequestContentProps> = ({ onBack, onNextStep }) => {
  const { user } = useAuth()
  const [errors, setErrors] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({})

  const [profileLoaded, setProfileLoaded] = useState(false)

  const [eventName, setEventName] = useState('')
  const { rentalId: rentalIdString } = useParams<{ rentalId: string }>()
  const rentalId = rentalIdString ? parseInt(rentalIdString, 10) : 0
  const [eventDate, setEventDate] = useState<string>('')

  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([])
  const [selectedTypeId, setSelectedTypeId] = useState<number | ''>('')

  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')

  const [provinces, setProvinces] = useState<Provinces[]>([])
  const [wards, setWards] = useState<Wards[]>([])
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | ''>('')
  const [selectedWardId, setSelectedWardId] = useState<number | ''>('')

  const [streetAddress, setStreetAddress] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const provinceOptions: Option[] = provinces.map(p => ({ value: p.code, label: p.name }))

  const wardOptions: Option[] = wards
    .filter(w => w.province_code === selectedProvinceId)
    .map(w => ({ value: w.code, label: w.name }))

  const minSelectableDate = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normalize to start of day
    const minDate = new Date(today)
    minDate.setDate(today.getDate() + 7)
    return minDate
  }, [])

  const validateStreetAddress = (value: string): string | null => {
    const raw = value.trim();
    if (!raw) return 'Street & House Number is required.';

    // Require comma separator: "houseNo, street"
    const commaIndex = raw.indexOf(',');
    if (commaIndex === -1) return 'Address must follow format: "number, Street name".';

    const num = raw.slice(0, commaIndex).trim();
    const street = raw.slice(commaIndex + 1).trim();

    if (!num) return 'House number is required.';

    /**
     * ✅ VN house number patterns:
     * - 26
     * - 26A
     * - 26/1
     * - 26/1A
     * - 26/1/2/3
     * - 26A/1/2B
     *
     * Rule: starts with digits, optional letters, then zero or more "/ segment"
     * where segment = digits + optional letters
     */
    const vnHouseNoRegex = /^\d+[A-Za-z]*?(?:\/\d+[A-Za-z]*?)*$/;

    if (!vnHouseNoRegex.test(num)) {
      return 'House number format is invalid. Examples: 26A, 26/1, 26/1/2/3.';
    }

    if (!street) return 'Street name is required.';

    // Street name cannot be numbers only (allow: "123 Street", but not "123")
    if (/^\d+$/.test(street)) return 'Street name cannot be numbers only.';

    return null;
  };

  const parseAddress = (addr?: string) => {
    if (!addr) return { street: '', wardName: '' }
    const parts = addr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    if (parts.length <= 1) return { street: addr.trim(), wardName: '' }
    const wardName = parts[parts.length - 1]
    const street = parts.slice(0, -1).join(', ')
    return { street, wardName }
  }

  const FieldError = ({ name }: { name: string }) => {
    if (!fieldErrors[name]) return null
    return (
      <p className="text-red-600 text-xs mt-1 ml-1">
        {fieldErrors[name][0]}
      </p>
    )
  }

  const buildFullAddress = () => {
    const ward = wards.find(w => w.code === selectedWardId)?.name || ''
    return `${streetAddress}${ward ? `, ${ward}` : ''}`
  }

  const validateRequired = () => {
    const fe: { [key: string]: string[] } = {}

    if (!eventName.trim()) fe.eventName = ['Event Name is required.']
    if (!selectedTypeId) fe.selectedTypeId = ['Activity Type is required.']
    if (!phoneNumber.trim()) fe.phoneNumber = ['Phone Number is required.']
    if (!email.trim()) fe.email = ['Email Address is required.']

    const streetError = validateStreetAddress(streetAddress)
    if (streetError) fe.streetAddress = [streetError]

    if (!selectedProvinceId) fe.selectedProvinceId = ['Province is required.']
    if (!selectedWardId) fe.selectedWardId = ['Ward is required.']
    if (!eventDate) fe.eventDate = ['Event Date is required.']
    if (!startTime) fe.startTime = ['Start Time is required.']
    if (!endTime) fe.endTime = ['End Time is required.']

    if (eventDate) {
      const selectedDate = new Date(eventDate)
      selectedDate.setHours(0, 0, 0, 0)
      if (selectedDate < minSelectableDate) {
        fe.eventDate = ['Event Date must be more than 6 days in the future.']
      }
    }

    setFieldErrors(fe)
    return Object.keys(fe).length === 0
  }

  const handleSaveDraft = async () => {
    if (!validateRequired()) return

    const nowIso = new Date().toISOString()

    const body: any = {
      eventName,
      phoneNumber,
      email,
      description,
      address: buildFullAddress(),
      city: provinces.find(p => p.code === selectedProvinceId)?.name || '',
      startTime,
      endTime,
      updatedDate: nowIso,
      requestedDate: nowIso,
      eventDate: eventDate ? new Date(eventDate).toISOString() : null,
      isDeleted: false,
      status: 'Draft',
      accountId: user?.accountId,
      activityTypeId: Number(selectedTypeId) // <-- send ID to API
    }

    if (!rentalId) {
      body.createdDate = nowIso
    }

    if (rentalId) {
      body.id = rentalId
    }

    try {
      let res
      if (rentalId) res = await customerUpdateRentalAsync(body)
      else res = await customerCreateRentalAsync(body)

      if (res?.success === false && res?.errors?.length > 0) {
        setErrors(res.errors)
        return
      }

      setErrors([])
      return res?.id ?? rentalId
    } catch (err: any) {
      console.log('FE caught:', err?.response?.data)

      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setErrors(err.response.data.errors)
        return
      }

      if (err.response?.data?.message) {
        setErrors([err.response.data.message])
        return
      }

      if (err.response?.data?.errors && typeof err.response.data.errors === 'object') {
        const fe: any = {}
        for (const key in err.response.data.errors) {
          fe[key] = err.response.data.errors[key]
        }
        setFieldErrors(fe)
        return
      }

      setErrors(['Something went wrong. Please try again.'])
    }
  }

  const handleNextStepClick = async () => {
    const id = await handleSaveDraft()
    if (!id) return
    onNextStep(id, Number(selectedTypeId))
  }

  // LOAD DROPDOWN DATA
  useEffect(() => {
    ;(async () => {
      const types = await getActivityTypeByEAIdAsync()
      setActivityTypes(types)
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      setProvinces(await getAllProvincesAsync())
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      const res = await getAllWardsAsync()
      setWards(res)
    })()
  }, [])

  useEffect(() => {
    if (!selectedProvinceId) {
      setSelectedWardId('')
    }
  }, [selectedProvinceId])

  // AUTO FILL CONTACT INFO FROM PROFILE (create mode only)
  useEffect(() => {
    if (!user?.accountId) return
    if (profileLoaded) return
    if (rentalId) return // ✅ edit mode: lấy theo rental, không lấy profile

    ;(async () => {
      try {
        const p = await getProfile()

        // ✅ chỉ set nếu field đang trống (không ghi đè khi user đã nhập)
        setPhoneNumber(prev => (prev?.trim() ? prev : (p.phoneNumber ?? '')))
        setEmail(prev => (prev?.trim() ? prev : (p.email ?? '')))

        // (Tuỳ chọn) Nếu muốn auto-fill địa chỉ vào ô Street luôn:
        // setStreetAddress(prev => (prev?.trim() ? prev : (p.address ?? '')))

        setProfileLoaded(true)
      } catch (e) {
        console.error('Failed to load profile:', e)
        setProfileLoaded(true) // tránh gọi lại liên tục
      }
    })()
  }, [user?.accountId, profileLoaded, rentalId])

  // LOAD EXISTING RENTAL (edit mode)
  useEffect(() => {
    if (!rentalId || provinces.length === 0 || wards.length === 0) return

    ;(async () => {
      try {
        const r = await getRentalByIdAsync(rentalId)

        setEventName(r.eventName ?? '')
        setPhoneNumber(r.phoneNumber ?? '')
        setEmail(r.email ?? '')
        setDescription(r.description ?? '')
        setEventDate(r.eventDate ? String(r.eventDate).slice(0, 10) : '')
        setStartTime((r.startTime || '').slice(0, 5))
        setEndTime((r.endTime || '').slice(0, 5))

        setSelectedTypeId(r.activityTypeId ?? '')

        const { street, wardName } = parseAddress(r.address)
        setStreetAddress(street)

        const province = provinces.find(p => p.name === r.city)
        if (!province) return

        setSelectedProvinceId(province.code)

        if (wardName) {
          const matchedWard = wards.find(
            (w: Wards) => w.province_code === province.code && w.name === wardName
          )
          if (matchedWard) {
            setSelectedWardId(matchedWard.code)
          }
        }
      } catch (e) {
        console.error('Failed to load rental by id', e)
      }
    })()
  }, [rentalId, provinces, wards])

  // RENDER UI
  return (
    <div className="space-y-8 bg-white p-8 rounded-xl shadow border border-gray-200 w-full">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <h2 className="text-2xl font-semibold text-center mb-4">
        {rentalId ? 'Edit Rental Request' : 'Create Rental Request'}
      </h2>

      {/* EVENT INFO */}
      <div className="p-6 border border-purple-300 rounded-xl space-y-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-purple-600" size={20} />
          <h3 className="font-semibold text-lg text-gray-800">Event Information</h3>
        </div>

        {/* Event Name */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1">Event Name <span className='text-red-500'>*</span></label>
          <input
            type="text"
            value={eventName}
            onChange={e => setEventName(e.target.value)}
            placeholder="Enter your event name"
            className="w-full border rounded-md px-4 py-2.5 text-sm focus:ring-purple-500"
          />
          <FieldError name="eventName" />
        </div>

        {/* Activity Type (packages) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">Activity Type <span className='text-red-500'>*</span></label>
            <select
              value={selectedTypeId}
              onChange={e => setSelectedTypeId(Number(e.target.value) || '')}
              className="w-full border rounded-md px-4 py-2.5 text-sm"
            >
              <option value="">Select package...</option>
              {activityTypes.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} {/* name shown, id used as value */}
                </option>
              ))}
            </select>
            <FieldError name="selectedTypeId" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1">Event Description <span className='text-red-500'>*</span></label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your event in detail..."
            className="w-full border rounded-md px-4 py-2.5 text-sm min-h-[80px]"
          />
        </div>
      </div>

      {/* CONTACT INFORMATION */}
      <div className="p-6 border rounded-xl space-y-6">
        <div className="flex items-center gap-2">
          <Home className="text-purple-600" size={20} />
          <h3 className="font-semibold text-lg text-gray-800">Contact Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">Phone Number <span className='text-red-500'>*</span></label>
            <input
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full border rounded-md px-4 py-2.5 text-sm"
            />
            <FieldError name="phoneNumber" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">Email <span className='text-red-500'>*</span></label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              type="email"
              className="w-full border rounded-md px-4 py-2.5 text-sm"
            />
            <FieldError name="email" />
          </div>
        </div>
      </div>

      {/* LOCATION + TIME */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="p-6 border rounded-xl space-y-6">
          <div className="flex items-center gap-2">
            <MapPin className="text-purple-600" size={20} />
            <h3 className="font-semibold text-lg text-gray-800">Event Location</h3>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">Street <span className='text-red-500'>*</span></label>
            <input
              value={streetAddress}
              onChange={e => setStreetAddress(e.target.value)}
              placeholder="e.g., 123, Main Street"
              className="w-full border rounded-md px-4 py-2.5 text-sm"
            />
            <FieldError name="streetAddress" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">Province <span className='text-red-500'>*</span></label>
              <Select<Option>
                options={provinceOptions}
                value={provinceOptions.find(opt => opt.value === selectedProvinceId) || null}
                onChange={(option: SingleValue<Option>) => 
                  setSelectedProvinceId(option?.value ?? '')
                }
                isSearchable={true}
                placeholder="Select Province"
                className="basic-select"
                classNamePrefix="select"
                isClearable={true}
                styles={{
                  control: (provided: any) => ({
                    ...provided,
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    minHeight: '2.5rem',
                    fontSize: '0.875rem',
                  }),
                }}
              />
              <FieldError name="selectedProvinceId" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">Ward <span className='text-red-500'>*</span></label>
              <Select<Option>
                options={wardOptions}
                value={wardOptions.find(opt => opt.value === selectedWardId) || null}
                onChange={(option: SingleValue<Option>) => 
                  setSelectedWardId(option?.value ?? '')
                }
                isSearchable={true}
                placeholder="Select Ward"
                isDisabled={!selectedProvinceId || wardOptions.length === 0}
                className="basic-select"
                classNamePrefix="select"
                isClearable={true}
                styles={{
                  control: (provided: any) => ({
                    ...provided,
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    minHeight: '2.5rem',
                    fontSize: '0.875rem',
                  }),
                }}
              />
              <FieldError name="selectedWardId" />
            </div>
          </div>
        </div>

        {/* TIME */}
        <div className="p-6 border rounded-xl space-y-6">
          <div className="flex items-center gap-2">
            <Clock className="text-purple-600" size={20} />
            <h3 className="font-semibold text-lg text-gray-800">Event Time</h3>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Event Date <span className='text-red-500'>*</span></label>

            <DatePicker
              selected={eventDate ? new Date(eventDate) : null}
              onChange={d => setEventDate(d ? d.toISOString().slice(0, 10) : '')}
              minDate={minSelectableDate}
              placeholderText="Select event date"
              className="w-full border rounded-md px-4 py-2.5 text-sm"
              dateFormat="dd-MM-yyyy"
            />

            <FieldError name="eventDate" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <BlockTimePicker label="Start Time" value={startTime} onChange={setStartTime} />
              <FieldError name="startTime" />
            </div>
            <div className="flex flex-col">
              <BlockTimePicker label="End Time" value={endTime} onChange={setEndTime} />
              <FieldError name="endTime" />
            </div>
          </div>
        </div>
      </div>

      {/* ERROR PANEL */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-4 rounded-xl mb-6 shadow-sm">
          <p className="font-semibold mb-2">Please fix the following issues:</p>

          <div className="space-y-1 text-sm">
            {errors.map((e, i) => (
              <p key={i} className="ml-1">
                • {e}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* BUTTONS */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          onClick={async () => {
            const id = await handleSaveDraft()
            if (id) onBack()
          }}
          className="px-5 py-2.5 rounded-md bg-gray-600 text-white hover:bg-gray-700 text-sm"
        >
          Save as Draft
        </button>

        <button
          onClick={handleNextStepClick}
          className="px-5 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
        >
          Customize Robot
        </button>
      </div>
    </div>
  )
}

export default CreateRentalRequestContent