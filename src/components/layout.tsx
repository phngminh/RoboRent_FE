import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '../components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import Header from './header'
import Footer from './footer'

interface Slide {
  id: number
  image: string
  title: string
  description: string
}

export default function Layout({ children }: { children: React.ReactNode }) {
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
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
                    <button 
                      className='bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500'
                      onClick={(e) => {
                        e.preventDefault()
                        scrollToSection('home')
                      }}
                    >
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
      <main>{children}</main>
      <Footer />
    </>
  )
}
