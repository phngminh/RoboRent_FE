import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const mockRobots = [
  {
    id: 1,
    robotName: 'PartyBot Pro',
    roboType: 'Entertainment',
    image: 'https://vr360.com.vn/uploads/images/robot-va-tri-tue-nhan-tao-buoc-tien-trong-cuoc-cach-mang-4-0%20(2).jpg',
    description: 'Interactive party robot that sings, dances and entertains guests'
  },
  {
    id: 2,
    robotName: 'EventServo',
    roboType: 'Event Service',
    image: 'https://www.thedailyupside.com/wp-content/uploads/2025/02/cio_humanoid-robot_02-10-25_iStock-iLexx.png',
    description: 'Professional event robot for serving drinks and appetizers'
  },
  {
    id: 3,
    robotName: 'DanceMaster',
    roboType: 'Performance',
    image: 'https://www.thedailyupside.com/wp-content/uploads/2025/02/cio_humanoid-robot_02-10-25_iStock-iLexx.png',
    description: 'Advanced dancing robot with choreographed performances'
  },
  {
    id: 4,
    robotName: 'CaterBot',
    roboType: 'Catering',
    image: 'https://www.thedailyupside.com/wp-content/uploads/2025/02/cio_humanoid-robot_02-10-25_iStock-iLexx.png',
    description: 'Smart catering robot for weddings and special events'
  },
  {
    id: 5,
    robotName: 'DJ Robo',
    roboType: 'Music',
    image: 'https://www.thedailyupside.com/wp-content/uploads/2025/02/cio_humanoid-robot_02-10-25_iStock-iLexx.png',
    description: 'Musical robot DJ for parties and celebrations'
  },
  {
    id: 6,
    robotName: 'PhotoBot',
    roboType: 'Photography',
    image: 'https://www.thedailyupside.com/wp-content/uploads/2025/02/cio_humanoid-robot_02-10-25_iStock-iLexx.png',
    description: 'Event photography robot with AI-powered photo taking'
  },
  {
    id: 7,
    robotName: 'HostBot',
    roboType: 'Hosting',
    image: 'https://www.thedailyupside.com/wp-content/uploads/2025/02/cio_humanoid-robot_02-10-25_iStock-iLexx.png',
    description: 'Interactive host robot for greeting and guiding event guests'
  }
]

const RobotCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const startAutoSlide = () => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          setIsTransitioning(true)
          setTimeout(() => setIsTransitioning(false), 500)
          return (prevIndex + 1) % mockRobots.length
        })
      }, 5000)
    }

    startAutoSlide()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const goToSlide = (index: number) => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToPrevious = () => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? mockRobots.length - 1 : prevIndex - 1
    )
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToNext = () => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mockRobots.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const extendedRobots = [...mockRobots, ...mockRobots, ...mockRobots]
  const startIndex = mockRobots.length + currentIndex

  return (
    <div className='relative bg-white py-20 px-6 overflow-hidden'>
      <div className='relative max-w-8xl mx-auto text-center -mt-8'>
        <p className='inline-block text-lg font-medium text-gray-600 tracking-wide mb-4 border border-gray-500 rounded-full px-4 py-1 bg-white'>
          POPULAR ROBOTS
        </p>
        <h1 className='text-[2.5rem] font-bold text-gray-700 mb-12'>
          Our <span className='text-emerald-500'>most requested</span> robots, trusted by thousands of customers
        </h1>

        <div className='relative w-full overflow-hidden'>
          <div 
            className='flex transition-transform duration-500 ease-in-out'
            style={{
              transform: `translateX(-${startIndex * (100 / 4.5)}%)`,
            }}
          >
            {extendedRobots.map((robot, index) => (
              <div
                key={`${robot.id}-${index}`}
                className='flex-shrink-0 px-3'
                style={{ width: `${100 / 3.6}%` }}
              >
                <div className='bg-white overflow-hidden'>
                  <div className='relative h-96 bg-gray-100'>
                    <img
                      src={robot.image || '/placeholder.svg'}
                      alt={robot.robotName}
                      className='w-full h-full object-cover'
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder.svg'
                      }}
                    />
                    <div className='absolute top-4 left-4 bg-blue-900 text-white px-3 py-1 text-sm font-medium'>
                      {robot.roboType}
                    </div>
                    <div className='absolute bottom-4 left-4 text-white text-left'>
                      <h3 className='text-2xl font-bold mb-2'>
                        {robot.robotName}
                      </h3>
                      <p className='text-lg mb-3 opacity-90'>
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
            className='absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-3 hover:bg-black/20 transition-all duration-300 z-10'
            disabled={isTransitioning}
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={goToNext}
            className='absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-3 hover:bg-black/20 transition-all duration-300 z-10'
            disabled={isTransitioning}
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className='flex justify-center gap-2 mt-8'>
            {mockRobots.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'w-8 bg-emerald-500' : 'w-2 bg-gray-300'
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