import { useState, useEffect } from 'react'
import { Calendar, Settings, CreditCard, Truck, Check, ChevronLeft, ChevronRight } from 'lucide-react'

const HowItWorks = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      icon: Calendar,
      title: 'Step 1: Inquiry & Selection',
      description: 'Explore our catalog and get expert guidance to find the perfect robot for your event.',
      features: ['Access To 100+ Robots', 'Customized Requests'],
      gradient: 'from-blue-600 to-emerald-500',
      topGradient: 'from-blue-500 via-emerald-400 to-blue-500',
      image: 'https://www.shutterstock.com/image-photo/small-shopping-cart-on-laptop-600nw-2459651035.jpg'
    },
    {
      icon: Settings,
      title: 'Step 2: Consultation & Demonstration',
      description: 'Receive personalized recommendations and demo videos to visualize your event setup',
      features: ['Free Consultation', 'Real-time Demos'],
      gradient: 'from-emerald-600 to-blue-500',
      topGradient: 'from-emerald-500 via-blue-400 to-emerald-500',
      image: 'https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?w=800&h=600&fit=crop'
    },
    {
      icon: CreditCard,
      title: 'Step 3: Confirmation & Payment',
      description: 'Secure your booking instantly through verified payment channels.',
      features: ['Transparent Pricing', 'Refund Guarantee'],
      gradient: 'from-blue-600 to-emerald-500',
      topGradient: 'from-blue-500 via-emerald-400 to-blue-500',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop'
    },
    {
      icon: Truck,
      title: 'Step 4: Delivery & On-site Support',
      description: 'Enjoy seamless delivery and on-site technical support for a flawless experience.',
      features: ['Trained Operators', '24/7 Support'],
      gradient: 'from-emerald-600 to-blue-500',
      topGradient: 'from-emerald-500 via-blue-400 to-emerald-500',
      image: 'https://deliverit.ae/wp-content/uploads/2024/08/What-is-a-delivery-service-1024x536.png'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className='relative bg-gradient-to-b from-gray-50 via-white to-gray-50 py-20 px-6 overflow-hidden'>
      <div className='relative max-w-8xl mx-auto text-center -mt-8'>
        <p className='inline-block text-lg font-medium text-gray-600 tracking-wide mb-4 border border-gray-500 rounded-full px-4 py-1 bg-white'>
          HOW IT WORKS
        </p>
        <h1 className='text-[2.5rem] font-bold text-gray-700 mb-12'>
          Get your robot ready in <span className='text-emerald-500'>four</span> simple steps
        </h1>

        <div className='relative'>
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
                  <div className='relative bg-white shadow-2xl overflow-hidden'>
                    <div className='relative h-80 overflow-hidden'>
                      <img 
                        src={slide.image} 
                        alt={slide.title}
                        className='w-full h-full object-cover'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent' />
                      
                      {isCenter && (
                        <div className='absolute bottom-5 left-0 right-0 text-white px-8'>
                          <h3 className='text-4xl font-bold mb-1'>{slide.title}</h3>
                        </div>
                      )}
                    </div>

                    {isCenter && (
                      <div className='p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl'>
                        <p className='text-gray-700 text-lg leading-relaxed mb-6 font-light'>
                          {slide.description}
                        </p>
                        <ul className='space-y-3'>
                          {slide.features.map((feature, idx) => (
                            <li 
                              key={idx} 
                              className='flex items-center justify-center gap-3 group hover:translate-x-1 transition-transform duration-200'
                            >
                              <div className='bg-green-100 rounded-full p-1.5 group-hover:bg-green-200 transition-colors'>
                                <Check className='text-green-600 w-5 h-5 flex-shrink-0' />
                              </div>
                              <span className='font-medium text-lg text-gray-800'>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={prevSlide}
            className='absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-3 hover:bg-black/20 transition-all duration-300 z-10'
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={nextSlide}
            className='absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-3 hover:bg-black/20 transition-all duration-300 z-10'
          >
            <ChevronRight size={24} />
          </button>

          <div className='flex justify-center gap-2 mt-8'>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'w-8 bg-emerald-500' : 'w-2 bg-gray-300'
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