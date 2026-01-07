import { useState, useEffect } from 'react'
import { getActivityTypeByEAIdAsync } from '../../../apis/activitytype.api'
import { useNavigate } from 'react-router-dom'

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
  const [loading, setLoading] = useState(false)
  const [packages, setPackages] = useState<ActivityType[]>([])
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError(null)
      const types = await getActivityTypeByEAIdAsync()
      setPackages(types)
    } catch (error) {
      console.error('Error fetching packages:', error)
      setError('Failed to load packages. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const getFeatures = (pkg: ActivityType): Feature[] => {
    if (pkg.name.includes('Basic') || pkg.name.includes('Cơ bản')) {
      return [
        { name: '4 giờ robot cơ bản', included: true },
        { name: 'Robot cơ bản', included: true },
        { name: 'Shareable', included: true },
        { name: 'Robot nâng cao', included: false },
        { name: 'Quà biếu', included: false },
        { name: 'Robot toàn diện', included: false },
        { name: 'Includes Operator', included: pkg.includesOperator },
      ]
    } else if (pkg.name.includes('Standard') || pkg.name.includes('Thường')) {
      return [
        { name: '6 giờ robot nâng cao', included: true },
        { name: 'Robot nâng cao', included: true },
        { name: 'Shareable', included: true },
        { name: 'Robot cơ bản', included: true },
        { name: 'Quà biếu', included: true },
        { name: 'Robot toàn diện', included: false },
        { name: 'Includes Operator', included: pkg.includesOperator },
      ]
    } else {
      return [
        { name: '8 giờ robot toàn diện', included: true },
        { name: 'Robot toàn diện', included: true },
        { name: 'Shareable', included: true },
        { name: 'Robot cơ bản', included: true },
        { name: 'Robot nâng cao', included: true },
        { name: 'Quà biếu', included: true },
        { name: 'Includes Operator', included: pkg.includesOperator },
      ]
    }
  }

  const handlePackageClick = (id: number) => {
    navigate(`/package/${id}`)
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-96 text-red-400'>
        {error}
      </div>
    )
  }

  return (
    <div className='relative bg-gray-900 py-20 px-6 overflow-hidden'>
      <div className='relative max-w-8xl mx-auto text-center -mt-8'>
        <p className='inline-block text-lg font-medium text-emerald-300 tracking-wide mb-4 border border-emerald-500 rounded-full px-4 py-1 bg-gray-800' data-aos='fade-down'>
          OUR PACKAGES
        </p>
        <h1 className='text-[2.5rem] font-bold text-white mb-12' data-aos='fade-up'>
          Our <span className='bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'> event packages</span>, tailored for every occasion
        </h1>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto' data-aos='fade-left'>
          {packages.map((pkg) => {
            const features = getFeatures(pkg)
            return (
              <div
                key={pkg.id}
                className='bg-gray-800 overflow-hidden rounded-lg shadow-sm cursor-pointer group hover:shadow-xl transition-all duration-300 transform hover:scale-105'
                onClick={() => handlePackageClick(pkg.id)}
              >
                <div className='p-6'>
                  <div className='bg-gradient-to-br from-emerald-900 via-blue-900 to-indigo-900 group-hover:from-emerald-800 group-hover:via-blue-800 group-hover:to-indigo-800 transition-colors duration-300 rounded-t-lg p-4 mb-4'>
                    <h3 className='text-2xl font-bold mb-2 drop-shadow-lg text-white group-hover:text-emerald-100 transition-colors duration-300'>
                      {pkg.name}
                    </h3>
                    <div className='text-3xl font-bold text-emerald-400 drop-shadow-lg group-hover:text-emerald-300 transition-colors duration-300'>
                      {pkg.price.toLocaleString()} {pkg.currency}
                    </div>
                  </div>
                  <ul className='space-y-3 mb-6 text-gray-300 group-hover:text-gray-50 transition-colors duration-300'>
                    {features.map((feature, index) => (
                      <li key={index} className='flex items-center'>
                        <span className={`mr-3 text-xl font-bold ${feature.included ? 'text-green-400' : 'text-red-400'}`}>
                          {feature.included ? '✓' : '✗'}
                        </span>
                        <span className='text-sm leading-relaxed'>{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PackageDisplay