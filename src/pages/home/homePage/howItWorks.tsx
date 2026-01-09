import { useState, useEffect } from 'react'
import { Calendar, Settings, CreditCard, Truck, Check, ChevronLeft, ChevronRight } from 'lucide-react'

const HowItWorks = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [rotation, setRotation] = useState(0)

  const slides = [
    {
      icon: Calendar,
      title: 'Step 1: Activity Selection & Request',
      description: 'Choose the activity type for your event and submit your rental request with preferred date and time.',
      features: ['Activity-Based Selection', 'Flexible Scheduling'],
      gradient: 'from-emerald-500 to-emerald-700',
      topGradient: 'from-emerald-400 via-emerald-500 to-emerald-400',
      image: 'https://www.shutterstock.com/image-photo/small-shopping-cart-on-laptop-600nw-2459651035.jpg'
    },
    {
      icon: Settings,
      title: 'Step 2: Consultation & Demonstration',
      description: 'Receive personalized recommendations and demo videos to visualize your event setup',
      features: ['Free Consultation', 'Real-time Demos'],
      gradient: 'from-emerald-600 to-emerald-500',
      topGradient: 'from-emerald-500 via-emerald-400 to-emerald-500',
      image: 'https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?w=800&h=600&fit=crop'
    },
    {
      icon: CreditCard,
      title: 'Step 3: Contract Confirmation & Payment',
      description: 'Review and sign the service contract to secure your booking, followed by safe and verified payment.',
      features: ['Digital Contract', 'Transparent Pricing'],
      gradient: 'from-emerald-500 to-emerald-700',
      topGradient: 'from-emerald-400 via-emerald-500 to-emerald-400',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop'
    },
    {
      icon: Truck,
      title: 'Step 4: Delivery & On-site Support',
      description: 'Enjoy seamless delivery and on-site technical support for a flawless experience.',
      features: ['Trained Operators', '24/7 Support'],
      gradient: 'from-emerald-600 to-emerald-500',
      topGradient: 'from-emerald-500 via-emerald-400 to-emerald-500',
      image: 'https://deliverit.ae/wp-content/uploads/2024/08/What-is-a-delivery-service-1024x536.png'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360)
    }, 16)
    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className='relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-20 px-6 overflow-hidden'>
      <div className='relative max-w-8xl mx-auto text-center -mt-8'>
        <p className='inline-block text-lg font-medium text-emerald-400 tracking-wide mb-4 border border-emerald-500 rounded-full px-4 py-1 bg-gray-800' data-aos='fade-down'>
          HOW IT WORKS
        </p>
        <h1 className='text-[2.5rem] font-bold text-emerald-400 mb-12' data-aos='fade-up'>
          Get your robot ready in <span className='text-emerald-300'>four</span> simple steps
        </h1>

        <div className='relative' data-aos='fade-right'>
          <div className='flex items-center justify-center gap-4'>
            {[-1, 0, 1].map((offset) => {
              const index = (currentSlide + offset + slides.length) % slides.length
              const slide = slides[index]
              const isCenter = offset === 0
              
              return (
                <div
                  key={offset}
                  className={`transition-all duration-700 ease-in-out transform ${
                    isCenter 
                      ? 'w-full max-w-2xl z-20 opacity-100 scale-100' 
                      : 'w-80 z-10 opacity-50 scale-95 hidden lg:block cursor-pointer'
                  }`}
                  onClick={!isCenter ? (offset === -1 ? prevSlide : nextSlide) : undefined}
                >
                  {isCenter ? (
                    <div className='relative p-[2px] rounded-lg overflow-hidden'>
                      <div 
                        className='absolute inset-0 rounded-lg'
                        style={{
                          background: `conic-gradient(from ${rotation}deg, #10b981, #3b82f6, #8b5cf6, #10b981)`
                        }}
                      />
                      <div className='relative bg-gray-800 shadow-2xl overflow-hidden rounded-lg'>
                        <div className='relative h-80 overflow-hidden'>
                          <img 
                            src={slide.image} 
                            alt={slide.title}
                            className='w-full h-full object-cover'
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent' />
                        </div>

                        <div className='p-4 text-center'>
                          <h3 className='text-3xl font-bold text-emerald-300 mb-2'>{slide.title}</h3>
                          <p className='text-gray-300 font-semibold text-base mb-4 leading-relaxed max-w-lg mx-auto'>
                            {slide.description}
                          </p>

                          <div className='flex flex-row flex-wrap justify-center items-center gap-4 mb-3'>
                            {slide.features.map((feature, idx) => (
                              <div 
                                key={idx} 
                                className='flex items-center gap-3 bg-gray-700 px-5 py-3 rounded-xl shadow-sm'
                              >
                                <Check className='text-emerald-500 w-6 h-5 flex-shrink-0' />
                                <span className='bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-medium'>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='relative bg-gray-800 shadow-2xl overflow-hidden'>
                      <div className='relative h-80 overflow-hidden'>
                        <img 
                          src={slide.image} 
                          alt={slide.title}
                          className='w-full h-full object-cover'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent' />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={prevSlide}
            className='absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-300 p-3 hover:bg-black/20 transition-all duration-300 z-10'
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={nextSlide}
            className='absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-300 p-3 hover:bg-black/20 transition-all duration-300 z-10'
          >
            <ChevronRight size={24} />
          </button>

          <div className='flex justify-center gap-2 mt-8'>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'w-8 bg-emerald-500' : 'w-2 bg-gray-600'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowItWorks