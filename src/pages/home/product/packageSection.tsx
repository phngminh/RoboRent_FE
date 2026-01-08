import { useState, useEffect } from 'react'
import { getActivityTypeByEAIdAsync } from '../../../apis/activitytype.api'
import { useLocation, useNavigate } from 'react-router-dom'
import { Check, X, ChevronUp, ChevronDown, Coins } from 'lucide-react'
import path from '../../../constants/path'
import Layout from '../../../components/layout'
import { useAuth } from '../../../contexts/AuthContext'
import loginImg from  '../../../assets/login_img.png'

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
  roboTypes: any[]
}

interface Feature {
  name: string
  included: boolean
}

const PackageDisplay = () => {
  const { user } = useAuth()
  const [packages, setPackages] = useState<ActivityType[]>([])
  const [selectedPackage, setSelectedPackage] = useState<ActivityType | null>(null)
  const [selectedRoboType, setSelectedRoboType] = useState<string>('')
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [requireLoginModal, setRequireLoginModal] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isProductPage = location.pathname === path.products

  const fetchPackages = async () => {
    try {
      const types = await getActivityTypeByEAIdAsync()
      setPackages(types)
    } catch (error) {
      console.error('Error fetching packages:', error)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const getRobotTypeCountText = (pkg: ActivityType) => {
    const count = pkg.roboTypes?.length || 0
    return `2 giờ thuê cơ bản với ${count} loại robot`
  }

  const getFeatures = (pkg: ActivityType): Feature[] => {
    if (pkg.name.includes('Basic') || pkg.name.includes('Cơ bản')) {
      return [
        { name: getRobotTypeCountText(pkg), included: true },
        { name: 'Thời gian linh hoạt', included: true },
        { name: 'Bao gồm kỹ thuật viên đi kèm', included: pkg.includesOperator },
        { name: `Thêm giờ: +${pkg.hourlyRate.toLocaleString()} ${pkg.currency}/giờ`, included: true }
      ]
    } else if (pkg.name.includes('Standard') || pkg.name.includes('Thường')) {
      return [
        { name: getRobotTypeCountText(pkg), included: true },
        { name: 'Thời gian linh hoạt', included: true },
        { name: 'Bao gồm kỹ thuật viên đi kèm', included: pkg.includesOperator },
        { name: `Thêm giờ: +${pkg.hourlyRate.toLocaleString()} ${pkg.currency}/giờ`, included: true }
      ]
    } else {
      return [
        { name: getRobotTypeCountText(pkg), included: true },
        { name: 'Thời gian linh hoạt', included: true },
        { name: 'Bao gồm kỹ thuật viên đi kèm', included: pkg.includesOperator },
        { name: `Thêm giờ: +${pkg.hourlyRate.toLocaleString()} ${pkg.currency}/giờ`, included: true }
      ]
    }
  }

  const handlePackageClick = (pkg: ActivityType) => {
    if (!isProductPage) {
      navigate('/our-services')
      return
    }

    if (selectedPackage?.id === pkg.id) {
      setIsDetailOpen(false)
      setTimeout(() => {
        setSelectedPackage(null)
      }, 500)
      return
    }

    if (isDetailOpen) {
      setIsDetailOpen(false)

      setTimeout(() => {
        setSelectedPackage(pkg)
        setSelectedRoboType(pkg.roboTypes?.[0]?.typeName || '')
        setIsDetailOpen(true)
      }, 300)
    } else {
      setSelectedPackage(pkg)
      setSelectedRoboType(pkg.roboTypes?.[0]?.typeName || '')
      setIsDetailOpen(true)
    }
  }

  const handleSendRequestClick = () => {
    const isLoggedIn = !!user

    if (!isLoggedIn) {
      setRequireLoginModal(true)
      return
    }

    navigate('/create-request')
  }

  const buttonText = isProductPage ? 'View Details' : 'Explore More'

  const content = (
    <div className='relative bg-gray-900 py-20 px-6 overflow-hidden'>
      <div className='relative max-w-8xl mx-auto text-center -mt-8'>
        <p className='inline-block text-lg font-medium text-emerald-200 tracking-wide mb-4 border border-emerald-500 rounded-full px-4 py-1 bg-gray-800' data-aos='fade-down'>
          OUR PACKAGES
        </p>
        <h1 className='text-[2.5rem] font-bold text-emerald-300 mb-12' data-aos='fade-up'>
          Our <span className='bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'> event packages</span>, tailored for every occasion
        </h1>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto' data-aos='fade-left'>
          {packages.map((pkg) => {
            const features = getFeatures(pkg)
            return (
              <div
                key={pkg.id}
                className='bg-gradient-to-br from-emerald-900 via-blue-900 to-indigo-900 rounded-3xl p-8 cursor-pointer group hover:from-emerald-800 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 hover:scale-105 shadow-lg'
                onClick={() => handlePackageClick(pkg)}
              >
                <div className='text-left'>
                  <p className='text-sm font-medium text-emerald-300 mb-2 opacity-90'>
                    {pkg.code}
                  </p>
                  
                  <h3 className='text-4xl font-bold text-white mb-2 drop-shadow-lg'>
                    {pkg.price.toLocaleString()} <span className='text-2xl'>{pkg.currency}</span>
                  </h3>
                  
                  <p className='text-sm text-gray-300 mb-4 opacity-90'>
                    {pkg.shortDescription}
                  </p>

                  <ul className='space-y-3 mb-8'>
                    {features.map((feature, idx) => (
                      <li key={idx} className='flex items-start'>
                        <span className={`mr-3 mt-0.5 flex-shrink-0 w-5 h-5 rounded-full ${feature.included ? 'bg-green-400' : 'bg-red-400'} flex items-center justify-center`}>
                          <span className='text-white text-xs font-bold'>
                            {feature.included ? <Check size={16} /> : <X size={16} />}
                          </span>
                        </span>
                        <span className='text-sm text-gray-200 font-medium leading-relaxed'>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className='relative w-full bg-emerald-400 text-gray-900 py-3 px-6 rounded-full font-semibold flex items-center justify-center hover:bg-emerald-300 transition-all duration-300'
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePackageClick(pkg)
                    }}
                  >
                    {buttonText}

                    {isProductPage && (
                      <span className='absolute right-6'>
                        {selectedPackage?.id === pkg.id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {isProductPage && (
          <div className='mt-12 max-w-6xl mx-auto overflow-hidden transition-all duration-500 ease-in-out'>
            <div 
              className={`
                relative bg-gradient-to-br from-emerald-900 via-blue-900 to-indigo-900
                rounded-3xl p-8 shadow-2xl
                transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                transform
                ${isDetailOpen
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'}
              `}
            >
              {selectedPackage && (
                <>
                  <div className='grid lg:grid-cols-3 gap-8 items-start px-8 mt-4'>
                    <div className='lg:col-span-2 space-y-6 text-left'>
                      <div className='mt-0'>
                        <h2 className='text-4xl font-bold text-emerald-200 mb-2'>
                          {selectedPackage.name}
                        </h2>
                        <p className='text-emerald-300 text-lg opacity-85'>
                          {selectedPackage.shortDescription}
                        </p>
                        <div className='flex items-center gap-3 mt-4'>
                          <Coins className='w-10 h-10 text-purple-300' />

                          <span className='text-5xl font-bold bg-gradient-to-r from-blue-300 to-purple-600 bg-clip-text text-transparent'>
                            {selectedPackage.price.toLocaleString()} {selectedPackage.currency}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className='text-xl font-semibold text-white mb-3 text-left'>Description</h3>
                        <p className='text-gray-100 leading-relaxed text-left opacity-90'>
                          {selectedPackage.description}
                        </p>
                      </div>

                      <div className='flex justify-start mt-6'>
                        <button 
                          className='bg-transparent border-2 border-emerald-500 text-emerald-300 hover:bg-emerald-600 hover:text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105'
                          onClick={handleSendRequestClick}
                        >
                          Send A Request
                        </button>
                      </div>
                    </div>

                    <div className='lg:col-span-1 mt-0'>
                      <div className='bg-white/10 rounded-2xl p-6 backdrop-blur-sm'>
                        <h3 className='text-xl font-semibold text-emerald-200 mb-6'>Package Details</h3>
                        
                        <div className='flex justify-between items-center mb-4 pb-4 border-b border-white/20'>
                          <span className='text-gray-300'>Package Code</span>
                          <span className='text-white font-semibold'>{selectedPackage.code}</span>
                        </div>

                        {selectedPackage.hourlyRate && (
                          <div className='flex justify-between items-center mb-4 pb-4 border-b border-white/20'>
                            <span className='text-gray-300'>Hourly Rate</span>
                            <span className='text-white font-semibold'>
                              {selectedPackage.hourlyRate.toLocaleString()} {selectedPackage.currency}/hour
                            </span>
                          </div>
                        )}

                        <div className='space-y-4'>
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-300 text-sm'>Operator Count</span>
                            <span className='text-white font-medium'>
                              {selectedPackage.operatorCount} {selectedPackage.includesOperator && '(Included)'}
                            </span>
                          </div>

                          <div className='flex justify-between items-center'>
                            <span className='text-gray-300 text-sm'>Minimum Minutes</span>
                            <span className='text-white font-medium'>{selectedPackage.minimumMinutes}</span>
                          </div>

                          <div className='flex justify-between items-center'>
                            <span className='text-gray-300 text-sm'>Billing Increment</span>
                            <span className='text-white font-medium'>{selectedPackage.billingIncrementMinutes} minutes</span>
                          </div>

                          <div className='flex justify-between items-center'>
                            <span className='text-gray-300 text-sm'>Tech Staff Fee</span>
                            <span className='text-white font-medium'>
                              {selectedPackage.technicalStaffFeePerHour.toLocaleString()} {selectedPackage.currency}/hour
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='mt-8 px-8'>
                    <div className='bg-white/10 rounded-full p-1 flex overflow-hidden max-w-2xl mx-auto'>
                      {selectedPackage.roboTypes?.map((roboType) => (
                        <button 
                          key={roboType.id || roboType.typeName}
                          className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            selectedRoboType === roboType.typeName
                              ? 'bg-white text-gray-900 shadow-md' 
                              : 'text-gray-300 hover:text-white'
                          }`}
                          onClick={() => setSelectedRoboType(roboType.typeName)}
                        >
                          {roboType.typeName}
                        </button>
                      ))}
                    </div>

                    {selectedPackage.roboTypes && selectedRoboType && (
                      <div className='mt-4 p-4 bg-white/5 rounded-xl'>
                        <h4 className='text-white font-semibold mb-2'>{selectedRoboType}</h4>
                        <p className='text-gray-200 text-sm leading-relaxed'>
                          {selectedPackage.roboTypes.find(rt => rt.typeName === selectedRoboType)?.description || 'No description available.'}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {requireLoginModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-300'>
          <div className='bg-gray-900 p-8 rounded-xl shadow-2xl text-center max-w-xl mx-4 relative border-2 border-emerald-600'>
            <button
              onClick={() => setRequireLoginModal(false)}
              className='absolute top-4 right-4 text-emerald-400 hover:text-emerald-300 transition-colors'
              aria-label='Close'
            >
              <X size={24} />
            </button>

            <div className='flex justify-center'>
              <img
                src={loginImg}
                alt='Email verification'
                className='w-72 h-72 object-contain'
                loading='eager'
              />
            </div>

            <h2 className='text-2xl font-bold font-orbitron -mt-4 mb-4 text-emerald-300'>
              Login to get started!
            </h2>
            
            <p className='text-gray-300 mb-6 leading-relaxed text-base px-10'>
              Please login to your account to send rental requests for 
              <span className='font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'> RoboRent</span>
              . If you don’t have an account yet, please sign up and verify your biometric authentication first.
            </p>
          </div>
        </div>
      )}
    </div>
  )
  
  if (isProductPage) {
    return <Layout>{content}</Layout>
  }
  
  return content
}

export default PackageDisplay