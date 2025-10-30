import React, { useState } from 'react'
import { Edit2, User } from 'lucide-react'

interface ProfileData {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  location: string
  address: string
  dateOfBirth: string
  gender: string
}

const AccountProfile: React.FC = () => {
  const [isEditingBasic, setIsEditingBasic] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: 'Brooklyn',
    lastName: 'Simmons',
    phoneNumber: '+91 98 34 53 2945',
    email: 'brooklyn.simmons@techholding.co',
    location: 'Ahmedabad, India',
    address: '227, Ashoka Shopping Centre, Naranpura, Ahmedabad, Gujarat, India - 400001',
    dateOfBirth: '1990-05-15',
    gender: 'Female'
  })

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveBasic = () => {
    setIsEditingBasic(false)
  }
  return (
    <div className='h-auto bg-gray-50 p-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='bg-white rounded-lg p-6 mb-6 shadow-sm'>
          <div className='flex items-center space-x-4'>
            <div className='w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center'>
              <User size={28} className='text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 -ml-8'>
                {profileData.firstName} {profileData.lastName}
              </h1>
              <p className='text-gray-600 ml-2'>{profileData.email}</p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg p-6 shadow-sm'>
          <div className='flex items-center justify-center mb-8 relative'>
            <h2 className='text-xl font-semibold text-gray-900 text-center'>Basic details</h2>
            <button
              onClick={() => (isEditingBasic ? handleSaveBasic() : setIsEditingBasic(true))}
              className='absolute right-0 flex items-center space-x-2 text-gray-600 hover:text-gray-900'
            >
              <Edit2 size={16} />
              <span className='text-sm font-medium'>{isEditingBasic ? 'SAVE' : 'EDIT'}</span>
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-left'>
            <div>
              <label className='block text-sm text-gray-500 mb-2 text-left'>First name</label>
              <input
                type='text'
                value={profileData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={!isEditingBasic}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 disabled:bg-white disabled:text-gray-900'
              />
            </div>

            <div>
              <label className='block text-sm text-gray-500 mb-2 text-left'>Last name</label>
              <input
                type='text'
                value={profileData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={!isEditingBasic}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 disabled:bg-white disabled:text-gray-900'
              />
            </div>

            <div>
              <label className='block text-sm text-gray-500 mb-2 text-left'>Phone no.</label>
              <input
                type='text'
                value={profileData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                disabled={!isEditingBasic}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 disabled:bg-white disabled:text-gray-900'
              />
            </div>

            <div>
              <label className='block text-sm text-gray-500 mb-2 text-left'>Date of Birth</label>
              <input
                type='date'
                value={profileData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                disabled={!isEditingBasic}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 disabled:bg-white disabled:text-gray-900'
              />
            </div>

            <div>
              <label className='block text-sm text-gray-500 mb-2 text-left'>Gender</label>
              <select
                value={profileData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                disabled={!isEditingBasic}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 disabled:bg-white disabled:text-gray-900'
              >
                <option value='Male'>Male</option>
                <option value='Female'>Female</option>
                <option value='Other'>Other</option>
              </select>
            </div>

            <div></div>

            <div className='col-span-1 md:col-span-3'>
              <label className='block text-sm text-gray-500 mb-2 text-left'>Address</label>
              <textarea
                value={profileData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditingBasic}
                rows={2}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 disabled:bg-white disabled:text-gray-900'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountProfile