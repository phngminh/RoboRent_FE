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
import Layout from '../../../components/layout'
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
  onNextStep: (rentalId: number, activityTypeId: number) => void
}

const CreateRentalRequestContent: React.FC<CreateRentalRequestContentProps> = ({ onNextStep }) => {
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
    today.setHours(0, 0, 0, 0)
    const minDate = new Date(today)
    minDate.setDate(today.getDate() + 7)
    return minDate
  }, [])

  const validateStreetAddress = (value: string): string | null => {
    const raw = value.trim()
    if (!raw) return 'Street & House Number is required.'

    const commaIndex = raw.indexOf(',')
    if (commaIndex === -1) return 'Address must follow format: "number, Street name".'

    const num = raw.slice(0, commaIndex).trim()
    const street = raw.slice(commaIndex + 1).trim()

    if (!num) return 'House number is required.'

    const vnHouseNoRegex = /^\d+[A-Za-z]*?(?:\/\d+[A-Za-z]*?)*$/

    if (!vnHouseNoRegex.test(num)) {
      return 'House number format is invalid. Examples: 26A, 26/1, 26/1/2/3.'
    }
    if (!street) return 'Street name is required.'
    if (/^\d+$/.test(street)) return 'Street name cannot be numbers only.'

    return null
  }

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
      <p className="text-red-600 text-xs mt-1 ml-1 flex items-center gap-1">
        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
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
      activityTypeId: Number(selectedTypeId)
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

  useEffect(() => {
    if (!user?.accountId) return
    if (profileLoaded) return
    if (rentalId) return

    ;(async () => {
      try {
        const p = await getProfile()

        setPhoneNumber(prev => (prev?.trim() ? prev : (p.phoneNumber ?? '')))
        setEmail(prev => (prev?.trim() ? prev : (p.email ?? '')))

        setProfileLoaded(true)
      } catch (e) {
        console.error('Failed to load profile:', e)
        setProfileLoaded(true)
      }
    })()
  }, [user?.accountId, profileLoaded, rentalId])

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

  return (
    <Layout>
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 -z-10" />
      <div className="max-w-5xl mx-auto my-20 relative z-10 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 w-full min-h-screen bg-white">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
          {rentalId ? 'Edit Rental Request' : 'Create Your Rental Request'}
        </h2>

        <div className="space-y-8">
          <div className="p-8 border border-purple-300 rounded-2xl bg-white shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-purple-600" size={24} />
              <h3 className="font-bold text-xl text-gray-800">Event Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Name <span className='text-red-500'>*</span></label>
                <input
                  type="text"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your event name"
                />
                <FieldError name="eventName" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Activity Type <span className='text-red-500'>*</span></label>
                  <select
                    value={selectedTypeId}
                    onChange={e => setSelectedTypeId(Number(e.target.value) || '')}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">Select package...</option>
                    {activityTypes.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <FieldError name="selectedTypeId" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Description <span className='text-red-500'>*</span></label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm min-h-[100px] focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-vertical"
                  placeholder="Describe your event in detail..."
                />
              </div>
            </div>
          </div>

          <div className="p-8 border border-purple-300 rounded-2xl bg-white shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <Home className="text-purple-600" size={24} />
              <h3 className="font-bold text-xl text-gray-800">Contact Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number <span className='text-red-500'>*</span></label>
                <input
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your phone number"
                />
                <FieldError name="phoneNumber" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className='text-red-500'>*</span></label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email address"
                  type="email"
                />
                <FieldError name="email" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="p-8 border border-purple-300 rounded-2xl bg-white shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <MapPin className="text-purple-600" size={24} />
                <h3 className="font-bold text-xl text-gray-800">Event Location</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Street <span className='text-red-500'>*</span></label>
                  <input
                    value={streetAddress}
                    onChange={e => setStreetAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., 123, Main Street"
                  />
                  <FieldError name="streetAddress" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Province <span className='text-red-500'>*</span></label>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ward <span className='text-red-500'>*</span></label>
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
            </div>

            <div className="p-8 border border-purple-300 rounded-2xl bg-white shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <Clock className="text-purple-600" size={24} />
                <h3 className="font-bold text-xl text-gray-800">Event Time</h3>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date <span className='text-red-500'>*</span></label>
                  <DatePicker
                    selected={eventDate ? new Date(eventDate) : null}
                    onChange={(d) => setEventDate(d ? d.toISOString().slice(0, 10) : '')}
                    minDate={minSelectableDate}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select date"
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
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mt-6 mb-2 shadow-sm">
            <p className="font-semibold mb-3 text-red-800">Please fix the following issues:</p>
            <div className="space-y-1 text-sm">
              {errors.map((e, i) => (
                <p key={i} className="ml-4">• {e}</p>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
          <button
            onClick={handleNextStepClick}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Customize Robot
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default CreateRentalRequestContent