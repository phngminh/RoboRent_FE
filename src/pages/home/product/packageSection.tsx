import { useState, useEffect } from 'react'
import { getActivityTypeByEAIdAsync } from '../../../apis/activitytype.api'
import { useLocation, useNavigate } from 'react-router-dom'
import { Check, X, ChevronUp, ChevronDown, Coins, Dot, Camera } from 'lucide-react'
import path from '../../../constants/path'
import Layout from '../../../components/layout'
import { useAuth } from '../../../contexts/AuthContext'
import loginImg from  '../../../assets/login_img.png'
import BrandActivationRobot from '../../../assets/Brand_Activation_Robot.jpg'
import HumanoidPerformanceRobot from '../../../assets/Humanoid_Performance_Robot.jpg'
import HostMCRobot from '../../../assets/Host_MC_Robot.jpg'
import PromotionalRobot from '../../../assets/Promotional_Robot.jpg'

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

const robotImageMap: Record<string, string> = {
  'Reception Robot': BrandActivationRobot,
  'Performance Robot': HumanoidPerformanceRobot,
  'Host Robot': HostMCRobot,
  'Promotion Robot': PromotionalRobot,
}

const PackageDisplay = () => {
  const { user } = useAuth()
  const [packages, setPackages] = useState<ActivityType[]>([])
  const [selectedPackage, setSelectedPackage] = useState<ActivityType | null>(null)
  const [selectedRoboType, setSelectedRoboType] = useState<string>('')
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [requireLoginModal, setRequireLoginModal] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [imageError, setImageError] = useState(false)
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

  useEffect(() => {
    Object.values(robotImageMap).forEach((imgSrc) => {
      const img = new Image()
      img.src = imgSrc
      img.onerror = () => console.warn(`Preload failed for: ${imgSrc}`)
    })
  }, [])

  const handleRoboSelect = (typeName: string) => {
    setSelectedRoboType(typeName)
    setIsDescriptionExpanded(false)
    setImageError(false)
  }

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
        const firstRoboType = pkg.roboTypes?.[0]?.typeName || ''
        setSelectedRoboType(firstRoboType)
        setIsDescriptionExpanded(false)
        setImageError(false)
        setIsDetailOpen(true)
      }, 300)
    } else {
      setSelectedPackage(pkg)
      const firstRoboType = pkg.roboTypes?.[0]?.typeName || ''
      setSelectedRoboType(firstRoboType)
      setIsDescriptionExpanded(false)
      setImageError(false)
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

  const getRobotImagePath = (typeName: string): string => {
    return robotImageMap[typeName] || ''
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
                          onClick={() => {
                            handleRoboSelect(roboType.typeName)
                          }}
                        >
                          {roboType.typeName}
                        </button>
                      ))}
                    </div>

                    {selectedPackage.roboTypes && selectedRoboType && (() => {
                      const robo = selectedPackage.roboTypes.find(rt => rt.typeName === selectedRoboType)
                      if (!robo) return null

                      const description = robo.description || 'No description available.'
                      const truncatedDescription = description.length > 200 
                        ? description.substring(0, 200) + '...' 
                        : description
                      
                      const imgSrc = getRobotImagePath(robo.typeName)
                      const hasImage = !!imgSrc && !imageError

                      return (
                        <div className='mt-6 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-2xl'>
                          <div className={`grid md:grid-cols-5 gap-6 items-stretch transition-all duration-300 ${isDescriptionExpanded ? 'min-h-[400px]' : 'h-[300px]'}`}>
                            <div className='md:col-span-2 relative overflow-hidden group h-full min-h-[300px]'>
                              <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 z-10'></div>
                              {hasImage ? (
                                <img 
                                  src={imgSrc}
                                  alt={robo.typeName}
                                  className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                                  onError={() => setImageError(true)}
                                  onLoad={() => setImageError(false)}
                                />
                              ) : (
                                <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800'>
                                  <Camera className='w-24 h-24 text-slate-500' />
                                </div>
                              )}
                              <div className='absolute bottom-4 left-4 right-4 z-20'>
                                <div className='bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20'>
                                  <h3 className='text-white font-bold text-lg'>{robo.typeName}</h3>
                                </div>
                              </div>
                            </div>

                            <div className='md:col-span-3 p-6 flex flex-col justify-center h-full'>
                              <div className='flex flex-col items-start gap-2'>
                                <div className='flex items-center justify-center gap-2 ml-3'>
                                  <div className='h-1 w-12 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full'></div>
                                  <h4 className='text-emerald-300 font-semibold text-sm uppercase tracking-wide'>
                                    Description
                                  </h4>
                                </div>
                                <div className='relative flex-1 flex flex-col justify-center items-center text-center w-full'>
                                  <p className='text-gray-200 leading-relaxed text-sm max-w-prose'>
                                    {isDescriptionExpanded ? description : truncatedDescription}
                                  </p>
                                  
                                  {description.length > 200 && (
                                    <div className='flex justify-center mt-3'>
                                      <button
                                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                        className='flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm transition-colors group'
                                      >
                                        <span>{isDescriptionExpanded ? 'Show Less' : 'Show More'}</span>
                                        {isDescriptionExpanded ? (
                                          <ChevronUp className='w-4 h-4 group-hover:-translate-y-0.5 transition-transform' />
                                        ) : (
                                          <ChevronDown className='w-4 h-4 group-hover:translate-y-0.5 transition-transform' />
                                        )}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    {(() => {
                      const robo = selectedPackage.roboTypes.find(rt => rt.typeName === selectedRoboType)

                      if (!robo?.robotAbilityResponses?.length) return null

                      const groupMap = robo.robotAbilityResponses.reduce(
                        (acc: any, item: any) => {
                          acc[item.abilityGroup] ??= []
                          acc[item.abilityGroup].push(item)
                          return acc
                        },
                        {}
                      )

                      return (
                        <div className='mt-6 space-y-4'>
                          <div className='flex items-center gap-3 mb-6'>
                            <div className='h-1 w-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full'></div>
                            <h4 className='text-white font-bold text-xl'>
                              Robot Capabilities
                            </h4>
                          </div>

                          <div className='grid sm:grid-cols-2 gap-4'>
                            {Object.entries(groupMap).map(([group, items]: any) => (
                              <div
                                key={group}
                                className='group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-emerald-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10'
                              >
                                <div className='flex items-center gap-2 mb-4 pb-3 border-b border-white/10'>
                                  <div className='w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 animate-pulse'></div>
                                  <h5 className='text-white font-semibold text-base'>
                                    {group}
                                  </h5>
                                </div>

                                <div className='flex flex-wrap gap-2'>
                                  {items.map((item: any) => (
                                    <span
                                      key={item.id}
                                      className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                        text-xs font-medium bg-gradient-to-r from-emerald-500/10 to-blue-500/10 
                                        text-emerald-300 border border-emerald-500/20
                                        hover:border-emerald-400/40 hover:shadow-sm transition-all duration-200
                                        group-hover:scale-105'
                                    >
                                      <Check size={12} className='text-emerald-400' />
                                      {item.label}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
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
              . If you don't have an account yet, please sign up and verify your biometric authentication first.
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