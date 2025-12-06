import React, { useEffect, useState } from 'react'
import { getAllEventActivityAsync } from '../../../apis/eventactivity.api'
import { getActivityTypeByEAIdAsync } from '../../../apis/activitytype.api'
import { getAllProvincesAsync, getAllWardsAsync } from '../../../apis/address.api'
import { customerCreateRentalAsync } from '../../../apis/rental.customer.api'
import 'react-time-picker/dist/TimePicker.css'
import 'react-clock/dist/Clock.css'
import { useAuth } from '../../../contexts/AuthContext'
import { MapPin, Clock, Home, CalendarDays } from 'lucide-react'
import BlockTimePicker from '../../../components/customer/BlockTimePicker'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Layout from '../../../components/layout'

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
}

interface Wards {
  name: string
  code: number
  province_code: number
}

interface CreateRentalRequestContentProps {
  onNextStep: (rentalId: number, activityTypeId: number) => void
}

const CreateRentalRequestContent: React.FC<CreateRentalRequestContentProps> = ({ onNextStep }) => {
  const { user } = useAuth()
  const [errors, setErrors] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({})

  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState<string>('')

  const [eventActivities, setEventActivities] = useState<EventActivity[]>([])
  const [selectedActivityId, setSelectedActivityId] = useState<number | ''>('')

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

  const validateStreetAddress = (value: string): string | null => {
    if (!value.trim()) return "Street & House Number is required."

    if (!value.includes(",")) 
      return 'Address must follow format: "number, Street name".'

    const [num, street] = value.split(",").map(s => s.trim())

    if (!num) return "House number is required."
    if (!/^[0-9A-Za-z]+$/.test(num))
      return "House number must be alphanumeric (e.g., 12 or 12A)."

    if (!street) return "Street name is required."
    if (/^\d+$/.test(street))
      return "Street name cannot be numbers only."

    return null
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
    if (!selectedActivityId) fe.selectedActivityId = ['Event Activity is required.']
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

    setFieldErrors(fe)
    return Object.keys(fe).length === 0
  }

  const handleSaveDraft = async () => {
    if (!validateRequired()) return

    const body: any = {
      eventName,
      description,
      phoneNumber,
      email,
      address: buildFullAddress(),
      city: provinces.find(p => p.code === selectedProvinceId)?.name || '',
      eventDate: eventDate ? new Date(eventDate).toISOString() : null,
      startTime,
      endTime,
      createdDate: new Date().toISOString(),
      requestedDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      status: 'Draft',
      isDeleted: false,
      accountId: user?.accountId,
      eventActivityId: selectedActivityId,
      activityTypeId: selectedTypeId
    }

    try {
      const res = await customerCreateRentalAsync(body)

      if (res?.success === false && res?.errors?.length > 0) {
        setErrors(res.errors)
        return
      }

      setErrors([])
      return res?.id
    } catch (err: any) {
      console.log("FE caught:", err?.response?.data)

      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setErrors(err.response.data.errors)
        return
      }

      if (err.response?.data?.message) {
        setErrors([err.response.data.message])
        return
      }

      if (err.response?.data?.errors && typeof err.response.data.errors === "object") {
        const fe: any = {}
        for (const key in err.response.data.errors) {
          fe[key] = err.response.data.errors[key]
        }
        setFieldErrors(fe)
        return
      }
      setErrors(["Something went wrong. Please try again."])
    }
  }

  const handleNextStepClick = async () => {
    const id = await handleSaveDraft()
    if (!id) return
    onNextStep(id, Number(selectedTypeId))
  }

  useEffect(() => {
    (async () => {
      setEventActivities(await getAllEventActivityAsync())
    })()
  }, [])

  useEffect(() => {
    (async () => {
      setProvinces(await getAllProvincesAsync())
    })()
  }, [])

  useEffect(() => {
    if (!selectedActivityId) {
      setActivityTypes([])
      return setSelectedTypeId('')
    }

    (async () => {
      const res = await getActivityTypeByEAIdAsync(Number(selectedActivityId))
      setActivityTypes(res)
    })()
  }, [selectedActivityId])

  useEffect(() => {
    if (!selectedProvinceId) {
      setWards([])
      return setSelectedWardId('')
    }

    (async () => {
      const res = await getAllWardsAsync()
      setWards(res)
    })()
  }, [selectedProvinceId])

  return (
    <Layout>
      <div className="max-w-5xl mx-auto my-8 bg-gradient-to-br from-white to-gray-50 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 w-full min-h-screen">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
          Create Your Rental Request
        </h2>

        <div className="space-y-8">
          <div className="p-8 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-purple-600" size={24} />
              <h3 className="font-bold text-xl text-gray-800">Event Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Name *</label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event Activity *</label>
                  <select
                    value={selectedActivityId}
                    onChange={e => setSelectedActivityId(Number(e.target.value) || '')}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">Select activity...</option>
                    {eventActivities.map(ea => (
                      <option key={ea.id} value={ea.id}>
                        {ea.name}
                      </option>
                    ))}
                  </select>
                  <FieldError name="selectedActivityId" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Activity Type *</label>
                  <select
                    value={selectedTypeId}
                    onChange={e => setSelectedTypeId(Number(e.target.value) || '')}
                    disabled={!selectedActivityId}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select type...</option>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm min-h-[100px] focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-vertical"
                  placeholder="Describe your event in detail..."
                />
              </div>
            </div>
          </div>

          <div className="p-8 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <Home className="text-purple-600" size={24} />
              <h3 className="font-bold text-xl text-gray-800">Contact Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your phone number"
                />
                <FieldError name="phoneNumber" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
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
            <div className="p-8 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <MapPin className="text-purple-600" size={24} />
                <h3 className="font-bold text-xl text-gray-800">Event Location</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Street & House Number *</label>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Province *</label>
                    <select
                      value={selectedProvinceId}
                      onChange={e => setSelectedProvinceId(Number(e.target.value) || '')}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="">Select Province</option>
                      {provinces.map(p => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <FieldError name="selectedProvinceId" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ward *</label>
                    <select
                      value={selectedWardId}
                      onChange={e => setSelectedWardId(Number(e.target.value) || '')}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={!selectedProvinceId}
                    >
                      <option value="">Select Ward</option>
                      {wards
                        .filter(w => w.province_code === selectedProvinceId)
                        .map(w => (
                          <option key={w.code} value={w.code}>
                            {w.name}
                          </option>
                        ))}
                    </select>
                    <FieldError name="selectedWardId" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <Clock className="text-purple-600" size={24} />
                <h3 className="font-bold text-xl text-gray-800">Event Time</h3>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date *</label>
                  <DatePicker
                    selected={eventDate ? new Date(eventDate) : null}
                    onChange={(d) => setEventDate(d ? d.toISOString().slice(0, 10) : '')}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select date"
                  />
                  <FieldError name="eventDate" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <BlockTimePicker label="Start Time *" value={startTime} onChange={setStartTime} />
                    <FieldError name="startTime" />
                  </div>
                  <div className="flex flex-col">
                    <BlockTimePicker label="End Time *" value={endTime} onChange={setEndTime} />
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