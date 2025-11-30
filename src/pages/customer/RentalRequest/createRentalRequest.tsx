import React, { useEffect, useState } from 'react'
import { getAllEventActivityAsync } from '../../../apis/eventactivity.api'
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
  onBack: () => void
  onNextStep: (rentalId: number, activityTypeId: number) => void
}

const CreateRentalRequestContent: React.FC<CreateRentalRequestContentProps> = ({ onBack, onNextStep }) => {
  const { user } = useAuth()
  const [errors, setErrors] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({})

  const [eventName, setEventName] = useState('')
  const { rentalId: rentalIdString } = useParams<{ rentalId: string }>()
  const rentalId = rentalIdString ? parseInt(rentalIdString, 10) : 0
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
  if (!value.trim()) return "Street & House Number is required.";

  // Must contain a comma
  if (!value.includes(",")) 
    return 'Address must follow format: "number, Street name".';

  const [num, street] = value.split(",").map(s => s.trim());

  // Validate number part
  if (!num) return "House number is required.";
  if (!/^[0-9A-Za-z]+$/.test(num))
    return "House number must be alphanumeric (e.g., 12 or 12A).";

  // Validate street name
  if (!street) return "Street name is required.";
  if (/^\d+$/.test(street))
    return "Street name cannot be numbers only.";

  return null;
};

  
  const parseAddress = (addr?: string) => {
    if (!addr) return { street: '', wardName: ''
    }
    const parts = addr.split(',').map(s => s.trim()).filter(Boolean)
    if (parts.length <= 1) return { street: addr.trim(), wardName: ''}
    const wardName = parts[parts.length - 1]
    const street = parts.slice(0, -1).join(', ')
    return { street, wardName }
  }

  // -----------------------------
  // FieldError component
  // -----------------------------
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
    if (!selectedActivityId) fe.selectedActivityId = ['Event Activity is required.']
    if (!selectedTypeId) fe.selectedTypeId = ['Activity Type is required.']
    if (!phoneNumber.trim()) fe.phoneNumber = ['Phone Number is required.']
    if (!email.trim()) fe.email = ['Email Address is required.']
const streetError = validateStreetAddress(streetAddress);
if (streetError) fe.streetAddress = [streetError];
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
      id: rentalId,
      eventName,
      description,
      phoneNumber,
      email,
      address: buildFullAddress(),
      city: provinces.find(p => p.code === selectedProvinceId)?.name || '',
      eventDate: eventDate ? new Date(eventDate).toISOString() : null,
      startTime,
      endTime,
      updatedDate: new Date().toISOString(),
      status: 'Draft',
      accountId: user?.accountId,
      eventActivityId: selectedActivityId,
      activityTypeId: selectedTypeId
    }

    if (!rentalId) {
      body.createdDate = new Date().toISOString()
      body.requestedDate = new Date().toISOString()
      body.isDeleted = false
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
  console.log("FE caught:", err?.response?.data);

  // 1. Backend ModelState dictionary
  if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
    setErrors(err.response.data.errors);
    return;
  }

  // 2. Backend ArgumentException → has "message"
  if (err.response?.data?.message) {
    setErrors([err.response.data.message]);  // <-- SHOW IT!
    return;
  }

  // 3. Backend validation object (dictionary)
  if (err.response?.data?.errors && typeof err.response.data.errors === "object") {
    const fe: any = {};
    for (const key in err.response.data.errors) {
      fe[key] = err.response.data.errors[key];
    }
    setFieldErrors(fe);
    return;
  }

  // 4. Fallback
  setErrors(["Something went wrong. Please try again."]);
}

  }

  const handleNextStepClick = async () => {
    const id = await handleSaveDraft()
    if (!id) return
    onNextStep(id, Number(selectedTypeId))
  }

  // =============================
  // LOAD DROPDOWN DATA
  // =============================
  useEffect(() => {
    (async () => {
      setEventActivities(await getAllEventActivityAsync())
    })()
  }, [])

  useEffect(() => {
  if (!rentalId || provinces.length === 0) return;

  (async () => {
    try {
      const r = await getRentalByIdAsync(rentalId);

      setEventName(r.eventName ?? "");
      setPhoneNumber(r.phoneNumber ?? "");
      setEmail(r.email ?? "");
      setDescription(r.description ?? "");
      setEventDate(r.eventDate ? String(r.eventDate).slice(0, 10) : "");
      setStartTime((r.startTime || "").slice(0, 5));
      setEndTime((r.endTime || "").slice(0, 5));

      setSelectedActivityId(r.eventActivityId ?? "");
      setSelectedTypeId(r.activityTypeId ?? "");

      // ===== PARSE ADDRESS =====
      const { street, wardName } = parseAddress(r.address);
      setStreetAddress(street);

      // ===== FIND PROVINCE =====
      const province = provinces.find(p => p.name === r.city);
      if (!province) return;

      setSelectedProvinceId(province.code);

      // ===== LOAD WARDS OF THIS PROVINCE =====
      const allWards = await getAllWardsAsync();
      setWards(allWards);

      // ===== FIND WARD =====
      if (wardName) {
const matchedWard = allWards.find(
  (w: Wards) => w.province_code === province.code && w.name === wardName
);
        if (matchedWard) {
          setSelectedWardId(matchedWard.code);
        }
      }
    } catch (e) {
      console.error("Failed to load rental by id", e);
    }
  })();
}, [rentalId, provinces]);


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

    ;(async () => {
      const res = await getActivityTypeByEAIdAsync(Number(selectedActivityId))
      setActivityTypes(res)
    })()
  }, [selectedActivityId])

  useEffect(() => {
    if (!selectedProvinceId) {
      setWards([])
      return setSelectedWardId('')
    }

    ;(async () => {
      const res = await getAllWardsAsync()
      setWards(res)
    })()
  }, [selectedProvinceId])

  // =============================
  // LOAD EXISTING RENTAL
  // =============================
  useEffect(() => {
    if (!rentalId) return

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

        setSelectedActivityId(r.eventActivityId ?? '')
        setSelectedTypeId(r.activityTypeId ?? '')

        setStreetAddress(r.address?.split(',')[0] ?? '')
      } catch (e) {
        console.error('Failed to load rental by id', e)
      }
    })()
  }, [rentalId])

  // =====================================================================
  // 🖼️ RENDER UI
  // =====================================================================
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

      {/* ================= EVENT INFO ================= */}
      <div className="p-6 border border-purple-300 rounded-xl space-y-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-purple-600" size={20} />
          <h3 className="font-semibold text-lg text-gray-800">Event Information</h3>
        </div>

        {/* Event Name */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1">Event Name *</label>
          <input
            type="text"
            value={eventName}
            onChange={e => setEventName(e.target.value)}
            className="w-full border rounded-md px-4 py-2.5 text-sm focus:ring-purple-500"
          />
          <FieldError name="eventName" />
        </div>

        {/* Event Activity + Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">Event Activity *</label>
            <select
              value={selectedActivityId}
              onChange={e => setSelectedActivityId(Number(e.target.value) || '')}
              className="w-full border rounded-md px-4 py-2.5 text-sm"
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
            <label className="text-sm font-medium text-gray-700 mb-1">Activity Type *</label>
            <select
              value={selectedTypeId}
              onChange={e => setSelectedTypeId(Number(e.target.value) || '')}
              disabled={!selectedActivityId}
              className="w-full border rounded-md px-4 py-2.5 text-sm"
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

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1">Event Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
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
            <label className="text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              className="w-full border rounded-md px-4 py-2.5 text-sm"
            />
            <FieldError name="phoneNumber" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
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

          {/* Street */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">Street *</label>
            <input
              value={streetAddress}
              onChange={e => setStreetAddress(e.target.value)}
              className="w-full border rounded-md px-4 py-2.5 text-sm"
            />
            <FieldError name="streetAddress" />
          </div>

          {/* Province & Ward */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">Province *</label>
              <select
                value={selectedProvinceId}
                onChange={e => setSelectedProvinceId(Number(e.target.value) || '')}
                className="w-full border rounded-md px-4 py-2.5 text-sm"
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
              <label className="text-sm font-medium text-gray-700 mb-1">Ward *</label>
              <select
                value={selectedWardId}
                onChange={e => setSelectedWardId(Number(e.target.value) || '')}
                className="w-full border rounded-md px-4 py-2.5 text-sm"
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

        {/* TIME */}
        <div className="p-6 border rounded-xl space-y-6">
          <div className="flex items-center gap-2">
            <Clock className="text-purple-600" size={20} />
            <h3 className="font-semibold text-lg text-gray-800">Event Time</h3>
          </div>

          {/* Event Date */}
<div className="flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">Event Date *</label>

  <DatePicker
    selected={eventDate ? new Date(eventDate) : null}
    onChange={(d) => setEventDate(d ? d.toISOString().slice(0, 10) : '')}
    className="w-full border rounded-md px-4 py-2.5 text-sm"
    dateFormat="dd-MM-yyyy"
  />

  <FieldError name="eventDate" />
</div>

          {/* Time Picker */}
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
        <p key={i} className="ml-1">• {e}</p>
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
