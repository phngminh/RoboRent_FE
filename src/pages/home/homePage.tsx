import { useState, useEffect } from 'react'
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Monitor, Sparkles, Zap } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '../../components/ui/carousel'
import Header from '../../components/header'
import Autoplay from 'embla-carousel-autoplay'
import Footer from '../../components/footer'
import HowItWorks from './howItWorks'

interface Slide {
  id: number
  image: string
  title: string
  description: string
}

export default function Home() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  const slides: Slide[] = [
    {
      id: 1,
      image:
        'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?cs=srgb&dl=pexels-vishnurnair-1105666.jpg&fm=jpg',
      title: 'Party Robots in Action',
      description: 'Bring your events to life with dancing and singing robots',
    },
    {
      id: 2,
      image:
        'https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg?cs=srgb&dl=pexels-helenalopes-696218.jpg&fm=jpg',
      title: 'Unforgettable Entertainment',
      description: 'Robots that light up the night with music and performance',
    },
    {
      id: 3,
      image:
        'https://videocdn.cdnpk.net/videos/c40ce6d1-34a6-5711-9d5e-dc98d748f3cb/horizontal/thumbnails/large.jpg?semt=ais_hybrid&item_id=6203282&w=740&q=80',
      title: 'Next-Level Parties',
      description: 'Make birthdays, weddings, and corporate events unforgettable with our robot rentals',
    },
  ]

  useEffect(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const scrollTo = (index: number) => {
    api?.scrollTo(index)
  }

  return (
    <div className='min-h-screen bg-white w-full overflow-hidden'>
      <Header />
      <Carousel
        setApi={setApi}
        className='relative h-screen w-full'
        opts={{
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
      >
        <CarouselContent className='h-screen'>
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className='h-screen'>
              <div className='relative h-full'>
                <img src={slide.image || '/placeholder.svg'} alt={slide.title} className='w-full h-full object-cover' />
                <div className='absolute inset-0 bg-black bg-opacity-40' />

                <div className='absolute inset-0 flex items-center justify-center -mt-16'>
                  <div className='text-center text-white px-4 max-w-4xl'>
                    <h2 className='text-3xl md:text-6xl lg:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 font-orbitron'>
                      {slide.title}
                    </h2>
                    <p className='text-xl md:text-1xl lg:text-2xl mb-8 opacity-90 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300'>
                      {slide.description}
                    </p>
                    <button className='bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500'>
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <button
          onClick={() => api?.scrollPrev()}
          className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-300 z-10'
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={() => api?.scrollNext()}
          className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-300 z-10'
        >
          <ChevronRight size={24} />
        </button>

        <div className='absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10'>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === current ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </Carousel>

      {/* <div className='relative bg-gradient-to-b from-gray-50 via-white to-gray-50 py-20 px-6 overflow-hidden'>
        <div className='relative max-w-6xl mx-auto text-center -mt-8'>
          <p className='inline-block text-lg font-medium text-gray-600 tracking-wide mb-4 border border-gray-500 rounded-full px-4 py-1 bg-white'>
            HOW IT WORKS
          </p>
          <h1 className='text-[2.5rem] font-bold text-gray-700 mb-12'>
            Get your robot ready in <span className='text-emerald-500'>four</span> simple steps
          </h1>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8'>
            <div
              className={`group relative rounded-3xl bg-white backdrop-blur p-8 shadow-md ring-1 ring-gray-200 transition-all duration-300 ${
                activeCard === 0 ? 'ring-4 ring-blue-300 ring-offset-white shadow-xl scale-105 -translate-y-2' : ''
              }`}
              onMouseEnter={() => setActiveCard(0)}
            >
              <div className='absolute -top-0.5 left-8 right-8 h-1 rounded-b-full bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500' />
              <div className='w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white flex items-center justify-center shadow-lg'>
                <Calendar className='w-8 h-8' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>Booking & Rental</h3>
              <p className='text-gray-600 text-sm leading-relaxed mb-3'>
                Browse and reserve your preferred robot. Select the best package and schedule that fits your event.
              </p>
              <ul className='text-sm text-gray-700 space-y-1 text-left'>
                <li className='flex items-center gap-2'>
                  <Check className='text-green-400' />
                  <span>100+ Robots Available</span>
                </li>
                <li className='flex items-center gap-2'>
                  <Check className='text-green-400' />
                  <span>Suggestions From Staff</span>
                </li>
              </ul>
            </div>

            <div
              className={`group relative rounded-3xl bg-white backdrop-blur p-8 shadow-md ring-1 ring-gray-200 transition-all duration-300 ${
                activeCard === 1 ? 'ring-4 ring-blue-300 ring-offset-white shadow-xl scale-105 -translate-y-2' : ''
              }`}
              onMouseEnter={() => setActiveCard(1)}
            >
              <div className='absolute -top-0.5 left-8 right-8 h-1 rounded-b-full bg-gradient-to-r from-emerald-500 via-blue-400 to-emerald-500' />
              <div className='w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-blue-500 text-white flex items-center justify-center shadow-lg'>
                <Settings className='w-8 h-8' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>Customization Features</h3>
              <p className='text-gray-600 text-sm leading-relaxed mb-3'>
                Personalize your robot's look and behavior for your event.
              </p>
              <ul className='text-sm text-gray-700 space-y-1 text-left'>
                <li className='flex items-center gap-2'>
                  <Check className='text-green-400' />
                  <span>Demo Videos From Staff</span>
                </li>
              </ul>
            </div>

            <div
              className={`group relative rounded-3xl bg-white backdrop-blur p-8 shadow-md ring-1 ring-gray-200 transition-all duration-300 ${
                activeCard === 2 ? 'ring-4 ring-blue-300 ring-offset-white shadow-xl scale-105 -translate-y-2' : ''
              }`}
              onMouseEnter={() => setActiveCard(2)}
            >
              <div className='absolute -top-0.5 left-8 right-8 h-1 rounded-b-full bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500' />
              <div className='w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white flex items-center justify-center shadow-lg'>
                <CreditCard className='w-8 h-8' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>Payment Processing</h3>
              <p className='text-gray-600 text-sm leading-relaxed mb-3'>
                Pay securely and track every transaction with ease.
              </p>
              <ul className='text-sm text-gray-700 space-y-1 text-left'>
                <li className='flex items-center gap-2'>
                  <Check className='text-green-400' />
                  <span>Payment History</span>
                </li>
              </ul>
            </div>

            <div
              className={`group relative rounded-3xl bg-white backdrop-blur p-8 shadow-md ring-1 ring-gray-200 transition-all duration-300 ${
                activeCard === 3 ? 'ring-4 ring-blue-300 ring-offset-white shadow-xl scale-105 -translate-y-2' : ''
              }`}
              onMouseEnter={() => setActiveCard(3)}
            >
              <div className='absolute -top-0.5 left-8 right-8 h-1 rounded-b-full bg-gradient-to-r from-emerald-500 via-blue-400 to-emerald-500' />
              <div className='w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-blue-500 text-white flex items-center justify-center shadow-lg'>
                <Truck className='w-8 h-8' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>Delivery Management</h3>
              <p className='text-gray-600 text-sm leading-relaxed mb-3'>
                Track your delivery in real time with simple verification steps.
              </p>
              <ul className='text-sm text-gray-700 space-y-1 text-left'>
                <li className='flex items-center gap-2'>
                  <Check className='text-green-400' />
                  <span>Live GPS Tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div> */}

      <HowItWorks />


      <div className='bg-white py-20 px-6'>
        <div className='max-w-6xl mx-auto -mt-8'>
          <p className='inline-block text-lg font-medium text-gray-600 tracking-wide mb-4 border border-gray-500 rounded-full px-4 py-1'>
            POPULAR ROBOTS
          </p>
          <h1 className='text-[2.5rem] font-bold text-gray-700 mb-12'>
            Our <span className='text-emerald-500'>most requested</span> robots, trusted by thousands of customers
          </h1>

          {/* <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='group relative rounded-3xl overflow-hidden bg-white ring-1 ring-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl'>
              <div className='relative'>
                <img className='w-full h-56 object-cover' src='https://images.pexels.com/photos/256839/pexels-photo-256839.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' alt='CleanBot Pro' />
                <span className='absolute top-4 left-4 text-xs bg-white/90 backdrop-blur px-2 py-1 rounded-full text-gray-800 ring-1 ring-gray-200'>Housekeeping</span>
                <span className='absolute top-4 right-4 text-xs bg-emerald-100 text-emerald-700 rounded-full px-2 py-1'>Available</span>
              </div>
              <div className='p-6'>
                <div className='flex items-start justify-between mb-2'>
                  <h3 className='text-lg font-semibold text-gray-900'>CleanBot Pro</h3>
                </div>
                <p className='text-gray-600 text-sm mb-5'>Advanced autonomous vacuum with mapping technology and pet hair specialization</p>
                <div className='flex items-center justify-between'>
                  <span className='text-blue-600 text-xl font-bold'>$35<span className='text-sm font-medium text-gray-500'>/day</span></span>
                  <button className='bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full'>Rent Now</button>
                </div>
              </div>
            </div>

            <div className='group relative rounded-3xl overflow-hidden bg-white ring-1 ring-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl'>
              <div className='relative'>
                <img className='w-full h-56 object-cover' src='https://images.pexels.com/photos/7241244/pexels-photo-7241244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' alt='DeliveryBot X1' />
                <span className='absolute top-4 left-4 text-xs bg-white/90 backdrop-blur px-2 py-1 rounded-full text-gray-800 ring-1 ring-gray-200'>Delivery</span>
                <span className='absolute top-4 right-4 text-xs bg-yellow-100 text-yellow-700 rounded-full px-2 py-1'>2 Available</span>
              </div>
              <div className='p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-1'>DeliveryBot X1</h3>
                <p className='text-gray-600 text-sm mb-5'>Autonomous delivery robot with 50kg capacity and GPS tracking</p>
                <div className='flex items-center justify-between'>
                  <span className='text-blue-600 text-xl font-bold'>$65<span className='text-sm font-medium text-gray-500'>/day</span></span>
                  <button className='bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full'>Rent Now</button>
                </div>
              </div>
            </div>

            <div className='group relative rounded-3xl overflow-hidden bg-white ring-1 ring-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl'>
              <div className='relative'>
                <img className='w-full h-56 object-cover' src='https://images.pexels.com/photos/8294651/pexels-photo-8294651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' alt='SecurityBot Guardian' />
                <span className='absolute top-4 left-4 text-xs bg-white/90 backdrop-blur px-2 py-1 rounded-full text-gray-800 ring-1 ring-gray-200'>Security</span>
                <span className='absolute top-4 right-4 text-xs bg-emerald-100 text-emerald-700 rounded-full px-2 py-1'>Available</span>
              </div>
              <div className='p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-1'>SecurityBot Guardian</h3>
                <p className='text-gray-600 text-sm mb-5'>24/7 patrol robot with thermal imaging and real-time alerts</p>
                <div className='flex items-center justify-between'>
                  <span className='text-blue-600 text-xl font-bold'>$120<span className='text-sm font-medium text-gray-500'>/day</span></span>
                  <button className='bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full'>Rent Now</button>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      <div className='min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 p-8'>
        <div className='max-w-6xl mx-auto mt-4'>
          <div className='mb-6'>
            <p className='inline-block text-lg font-medium text-gray-600 tracking-wide mb-4 border border-gray-500 rounded-full px-4 py-1 bg-white'>
              WHY CHOOSE US
            </p>
            <h1 className='text-[2.5rem] font-bold text-gray-700'>
              Why <span className='text-emerald-500'>RoboRent</span> is The Right Choice for You
            </h1>
          </div>

          <div className='grid grid-cols-[1.3fr_0.7fr] gap-6 mt-12 mb-10'>
            <div className='flex flex-col gap-6'>
                <div className='grid grid-cols-2 gap-6'>
                  <div className='group bg-gray-50 rounded-3xl p-8 animate-in slide-in-from-left-8 fade-in transition-all duration-150 hover:shadow-xl hover:-translate-y-1 border-2 border-gray-200 hover:border-gray-500'>
                    <div className='flex items-center gap-3 mb-4'>
                      <div className='w-11 h-11 flex-shrink-0 rounded-full border-2 border-gray-900 flex items-center justify-center'>
                        <Sparkles className='w-6 h-6 text-gray-900' />
                      </div>
                      <h2 className='text-2xl font-semibold text-gray-900 whitespace-nowrap'>
                        Tailored Experiences
                      </h2>
                    </div>
                    <p className='text-gray-600 leading-relaxed text-left'>
                      Design your dream robot setup — from appearance and voice style to performance features. 
                      Our platform lets you personalize every detail so your event feels truly unique and unforgettable.
                    </p>
                  </div>

                  <div className='group bg-gray-50 rounded-3xl p-8 animate-in slide-in-from-left-8 fade-in delay-200 transition-all duration-150 hover:shadow-xl hover:-translate-y-1 border-2 border-gray-200 hover:border-gray-500'>
                    <div className='flex items-center gap-3 mb-4'>
                      <div className='w-11 h-11 flex-shrink-0 rounded-full border-2 border-gray-900 flex items-center justify-center'>
                        <Zap className='w-6 h-6 text-gray-900' />
                      </div>
                      <h2 className='text-2xl font-semibold text-gray-900 whitespace-nowrap'>
                        Real-Time Assistance
                      </h2>
                    </div>
                    <p className='text-gray-600 leading-relaxed text-left'>
                      Every rental includes a dedicated RoboRent staff member who chats with you to fine-tune 
                      your order and provides live support during the event — ensuring your robot performs flawlessly.
                    </p>
                  </div>
                </div>

                <div className='group bg-gray-50 rounded-3xl p-8 animate-in slide-in-from-left-8 fade-in delay-300 transition-all duration-150 hover:shadow-xl hover:-translate-y-1 border-2 border-gray-200 hover:border-gray-500'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='w-11 h-11 rounded-full border-2 border-gray-900 flex items-center justify-center'>
                      <Monitor className='w-6 h-6 text-gray-900' />
                    </div>
                    <h2 className='text-2xl font-semibold text-gray-900'>
                      24/7 Event Monitoring
                    </h2>
                  </div>
                  <p className='text-gray-600 leading-relaxed text-left pl-8 pr-2'>
                    During your event, our support team monitors your robot remotely to handle 
                    updates, ensure smooth operation, and step in instantly if any technical issue occurs.
                  </p>
                </div>
            </div>

            <div className='bg-blue-900 max-w-[400px] w-full mx-auto rounded-3xl p-8 text-white animate-in slide-in-from-right-8 fade-in duration-700 delay-100'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-11 h-11 rounded-full border-2 border-white flex items-center justify-center'>
                  <Calendar className='w-6 h-6 text-white' />
                </div>
                <h2 className='text-2xl font-semibold whitespace-nowrap'>
                  Flexible Booking Options
                </h2>
              </div>
              <p className='text-white leading-relaxed mb-6 text-left'>
                Whether you need a robot for a few hours or several days, RoboRent gives you full scheduling 
                freedom. Adjust your rental duration and robot features anytime before your event.
              </p>

              <div className='flex justify-end'>
                <button className='bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full flex items-center gap-2 transition-colors'>
                  Send A Request
                  <ArrowRight className='w-5 h-5' />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-gray-800 py-12 px-6'>
        <div className='max-w-3xl mx-auto text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-100 mb-3'>
            Ready to Get Started?
          </h2>
          <p className='text-gray-300 text-base mb-8 max-w-xl mx-auto'>
            Join thousands of businesses and individuals who trust RoboRent for their automation needs.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <button className='bg-green-500 hover:bg-green-600 border-black text-gray-00 font-semibold px-6 py-3 rounded-lg transition-colors'>
              Browse All Robots
            </button>
            <button className='bg-gray-200 border-2 border-gray-800 text-gray-900 hover:bg-gray-700 hover:text-white font-semibold px-6 py-3 rounded-lg transition-colors'>
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}