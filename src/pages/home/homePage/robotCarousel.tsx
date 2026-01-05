import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getAllRoboTypes, type RoboTypeResponse } from '../../../apis/robotype.api'

const mockRobots : RoboTypeResponse[] = [
  {
    typeName: 'PartyBot Pro',
    image: 'https://www.thedailyupside.com/wp-content/uploads/2025/02/cio_humanoid-robot_02-10-25_iStock-iLexx.png',
    description: 'Interactive party robot that sings, dances and entertains guests'
  },
  {
    typeName: 'EventServo',
    image: 'https://www.thedailyupside.com/wp-content/uploads/2025/02/cio_humanoid-robot_02-10-25_iStock-iLexx.png',
    description: 'Professional event robot for serving drinks and appetizers'
  },
  {
    typeName: 'DanceMaster',
    image: 'https://www.thedailyupside.com/wp-content/uploads/2025/02/cio_humanoid-robot_02-10-25_iStock-iLexx.png',
    description: 'Advanced dancing robot with choreographed performances'
  },
  {
    typeName: 'CaterBot',
    image: 'https://www.thedailyupside.com/wp-content/uploads/2025/02/cio_humanoid-robot_02-10-25_iStock-iLexx.png',
    description: 'Smart catering robot for weddings and special events'
  },
  {
    typeName: 'DJ Robo',
    image: 'https://www.thedailyupside.com/wp-content/uploads/2025/02/cio_humanoid-robot_02-10-25_iStock-iLexx.png',
    description: 'Musical robot DJ for parties and celebrations'
  },
  {
    typeName: 'PhotoBot',
    image: 'https://www.thedailyupside.com/wp-content/uploads/2025/02/cio_humanoid-robot_02-10-25_iStock-iLexx.png',
    description: 'Event photography robot with AI-powered photo taking'
  },
  {
    typeName: 'HostBot',
    image: 'https://www.thedailyupside.com/wp-content/uploads/2025/02/cio_humanoid-robot_02-10-25_iStock-iLexx.png',
    description: 'Interactive host robot for greeting and guiding event guests'
  }
]

const RobotCarousel = () => {
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [robotTypes, setRobotTypes] = useState<RoboTypeResponse[]>([])
  const [isTransitioning, setIsTransitioning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const imageModules = import.meta.glob("../../../assets/*.{png,jpg,jpeg}", {
    eager: true,
  })

  const cleanFileName = (name: string) => {
    return name
      .replace(/\//g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/ /g, "_")
  }

  const getRobotImage = (name: string) => {
    const clean = cleanFileName(name)
    const entries = Object.entries(imageModules)
    const match = entries.find(([path]) =>
      path.toLowerCase().includes(clean.toLowerCase())
    )

    return match ? (match[1] as any).default : "";
  }

  const fetchRobotTypes = async () => {
    try {
      setLoading(true)
      const types = await getAllRoboTypes()
      const mapped = types.map(t => ({
        ...t,
        image: getRobotImage(t.typeName ?? "")
      }))
      setRobotTypes(mapped)
    } catch (error) {
      console.error('Error fetching rentals:', error)
      setRobotTypes(mockRobots)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRobotTypes()
  }, [])

  useEffect(() => {
    if (robotTypes.length === 0) return

    const handleNext = () => {
      setIsTransitioning(true)
      setCurrentIndex((prev) => (prev + 1) % robotTypes.length)
      setTimeout(() => setIsTransitioning(false), 500)
    }

    intervalRef.current = setInterval(handleNext, 2000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [robotTypes.length])

  useEffect(() => {
    return () => setIsTransitioning(false)
  }, [])

  const goToSlide = (index: number) => {
    if (isTransitioning || robotTypes.length === 0) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToPrevious = () => {
    if (isTransitioning || robotTypes.length === 0) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev === 0 ? robotTypes.length - 1 : prev - 1))
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToNext = () => {
    if (isTransitioning || robotTypes.length === 0) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev + 1) % robotTypes.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const extendedRobots = [...robotTypes, ...robotTypes, ...robotTypes]
  const startIndex = robotTypes.length + currentIndex

  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        Loading...
      </div>
    )
  }

  return (
    <div className='relative bg-gray-900 py-20 px-6 overflow-hidden'>
      <div className='relative max-w-8xl mx-auto text-center -mt-8'>
        <p className='inline-block text-lg font-medium text-emerald-400 tracking-wide mb-4 border border-emerald-500 rounded-full px-4 py-1 bg-gray-800' data-aos='fade-down'>
          OUR SERVICES
        </p>
        <h1 className='text-[2.5rem] font-bold text-emerald-400 mb-12' data-aos='fade-up'>
          Our <span className='text-emerald-300'> featured </span>robots, built with quality you can rely on
        </h1>

        <div className='relative w-full overflow-hidden' data-aos='fade-left'>
          <div 
            className='flex transition-transform duration-200 ease-in-out'
            style={{
              transform: `translateX(-${startIndex * (100 / 4.5)}%)`,
            }}
          >
            {extendedRobots.map((robot, index) => (
              <div
                key={`${robot.typeName}-${index}`}
                className='flex-shrink-0 px-3'
                style={{ width: `${100 / 3.6}%` }}
              >
                <div className='bg-gray-800 overflow-hidden rounded-lg shadow-sm'>
                  <div className='relative h-96 bg-gray-700'>
                    <img
                      src={robot.image || '/placeholder.svg'}
                      alt={robot.typeName}
                      className='w-full h-full object-cover'
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder.svg'
                      }}
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent' />
                    <div className='absolute bottom-4 left-4 right-4 text-left text-gray-300'>
                      <h3 className='text-2xl font-bold mb-2 drop-shadow-lg'>
                        {robot.typeName}
                      </h3>
                      <p className='text-base opacity-95 leading-snug drop-shadow-md mb-4'>
                        {robot.description}
                      </p>
                      {/* <div className='text-sm font-medium flex items-center'>
                        Learn More <span className='ml-1'>&gt;</span>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={goToPrevious}
            className='absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-300 p-3 hover:bg-black/20 transition-all duration-300 z-10'
            disabled={isTransitioning}
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={goToNext}
            className='absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-300 p-3 hover:bg-black/20 transition-all duration-300 z-10'
            disabled={isTransitioning}
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className='flex justify-center gap-2 mt-8'>
            {robotTypes.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'w-8 bg-emerald-500' : 'w-2 bg-gray-600'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
      </div>
    </div>
  )
}

export default RobotCarousel