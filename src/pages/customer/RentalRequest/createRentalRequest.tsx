import React, { useEffect, useState } from 'react'
import { getAllEventActivityAsync } from '../../../apis/eventactivity.api'
import { getActivityTypeByEAIdAsync } from '../../../apis/activitytype.api'
import { getAllProvincesAsync, getAllWardsAsync } from '../../../apis/address.api'
import { customerCreateRentalAsync, customerUpdateRentalAsync, getRentalByIdAsync } from '../../../apis/rental.customer.api'
import 'react-time-picker/dist/TimePicker.css'
import 'react-clock/dist/Clock.css'
import { useAuth } from '../../../contexts/AuthContext'
import { 
  ArrowLeft,
  MapPin,
  Clock,
  Home,
  Map,
  CalendarDays
} from 'lucide-react'
import BlockTimePicker from '../../../components/customer/BlockTimePicker'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


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
      accountId: user?.accountId,
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

// no popup — return quietly
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
  <div className="space-y-8 bg-white p-8 rounded-xl shadow border border-gray-200 w-full">
    {/* Back */}
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
    >
      <ArrowLeft size={18} />
      Back
    </button>

    <h2 className="text-2xl font-semibold text-center mb-8">
      {rentalId ? "Edit Rental Request" : "Create Rental Request"}
    </h2>
      {/* =========================
      EVENT INFORMATION
========================== */}
<div className="p-6 border border-purple-300 rounded-xl space-y-6">
  <div className="flex items-center gap-2">
    <CalendarDays className="text-purple-600" size={20} />
    <h3 className="font-semibold text-lg text-gray-800">Event Information</h3>
  </div>
  <p className="text-sm text-gray-500 -mt-3 ml-7">
    Provide the main details about your event.
  </p>

  {/* Event Name */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Event Name <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      placeholder="Enter event name"
      value={eventName}
      onChange={(e) => setEventName(e.target.value)}
      className="w-full border rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
    />
  </div>

  {/* Activity + Type */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Event Activity <span className="text-red-500">*</span>
      </label>
      <select
        value={selectedActivityId}
        onChange={(e) => setSelectedActivityId(Number(e.target.value) || "")}
        className="w-full border rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
      >
        <option value="">Select activity...</option>
        {eventActivities.map((ea) => (
          <option key={ea.id} value={ea.id}>
            {ea.name}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Activity Type <span className="text-red-500">*</span>
      </label>
      <select
        value={selectedTypeId}
        onChange={(e) => setSelectedTypeId(Number(e.target.value) || "")}
        disabled={!selectedActivityId}
        className={`w-full border rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 ${
          !selectedActivityId ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      >
        <option value="">Select type...</option>
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
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Event Description
    </label>
    <textarea
      placeholder="Describe your event..."
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      className="w-full border rounded-md px-4 py-2.5 text-sm min-h-[80px] focus:ring-2 focus:ring-purple-500"
    ></textarea>
  </div>
</div>

{/* =========================
      CONTACT INFORMATION
========================== */}
<div className="p-6 border rounded-xl space-y-6">
  <div className="flex items-center gap-2">
    <Home className="text-purple-600" size={20} />
    <h3 className="font-semibold text-lg text-gray-800">Contact Information</h3>
  </div>
  <p className="text-sm text-gray-500 -mt-3 ml-7">
    How we can reach you for this request.
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Phone Number <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        placeholder="e.g. 0912345678"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="w-full border rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Email Address <span className="text-red-500">*</span>
      </label>
      <input
        type="email"
        placeholder="e.g. example@mail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
      />
    </div>
  </div>
</div>


    {/* =====================================================
        LOCATION + TIME ON THE SAME ROW (SIDE BY SIDE)
    ====================================================== */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* ============= LOCATION ============= */}
      <div className="p-6 border rounded-xl space-y-6">
        <div className="flex items-center gap-2">
          <MapPin className="text-purple-600" size={20} />
          <h3 className="font-semibold text-lg text-gray-800">Event Location</h3>
        </div>

        {/* Street */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street & House Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 600 Trường Sa"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            className="w-full border rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Province + Ward */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
            <select
              value={selectedProvinceId}
              onChange={(e) => setSelectedProvinceId(Number(e.target.value) || "")}
              className="w-full border rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Province</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ward *</label>
            <select
              value={selectedWardId}
              onChange={(e) => setSelectedWardId(Number(e.target.value) || "")}
              disabled={!selectedProvinceId}
              className={`w-full border rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 ${
                !selectedProvinceId ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            >
              <option value="">Select Ward</option>
              {wards
                .filter((w) => w.province_code === selectedProvinceId)
                .map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* ============= TIME ============= */}
      <div className="p-6 border rounded-xl space-y-6">
        <div className="flex items-center gap-2">
          <Clock className="text-purple-600" size={20} />
          <h3 className="font-semibold text-lg text-gray-800">Event Time</h3>
        </div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Event Date <span className="text-red-500">*</span>
  </label>

  <DatePicker
    selected={eventDate ? new Date(eventDate) : null}
    onChange={(date: Date | null) => setEventDate(date ? date.toISOString().slice(0, 10) : "")}
    className="w-full border rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
    placeholderText="Select event date"
    dateFormat="dd-MM-yyyy"
    calendarStartDay={1}
    showPopperArrow={false}
  />
</div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Time */}
          <div>
<BlockTimePicker
  label="Start Time"
  value={startTime}
  onChange={(val) => setStartTime(val)}
/>
          </div>

          {/* End Time */}
          <div>
<BlockTimePicker
  label="End Time"
  value={endTime}
  onChange={(val) => setEndTime(val)}
/>
          </div>
        </div>
      </div>
    </div>

    {/* Buttons */}
    <div className="flex justify-end gap-4 pt-4">
<button
  onClick={async () => {
    const id = await handleSaveDraft();
    if (id) onBack();
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
);
}

export default CreateRentalRequestContent