import { useState, useEffect } from 'react'
import { ArrowRight, Calendar, Monitor, Sparkles, X, Zap } from 'lucide-react'
import HowItWorks from './howItWorks'
import RobotCarousel from './robotCarousel'
import emailImg from  '../../assets/email.jpg'
import Layout from '../../components/layout'

export default function Home() {
  const [showVerifyModal, setShowVerifyModal] = useState(false)

  useEffect(() => {
    const flag = localStorage.getItem('showVerifyModal')
    if (flag === 'true') {
      setShowVerifyModal(true)
      localStorage.removeItem('showVerifyModal')
    }
  }, [])

  return (
    <Layout>
      <div className='min-h-screen w-full overflow-hidden'>
        <HowItWorks />
        <RobotCarousel />

        <div className='min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 p-8'>
          <div className='max-w-6xl mx-auto mt-4'>
            <div className='mb-6'>
              <p className='inline-block text-lg font-medium text-gray-600 tracking-wide mb-4 border border-gray-500 rounded-full px-4 py-1 bg-white'>
                WHY CHOOSE US
              </p>
              <h1 className='text-[2.5rem] font-bold text-blue-900'>
                Why <span className='text-teal-500'>RoboRent</span> is The Right Choice for You
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
                Send A Request
              </button>
            </div>
          </div>
        </div>
        
        {showVerifyModal && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div className='bg-white p-8 rounded-xl shadow-2xl text-center max-w-xl mx-4 relative'>
              <button
                onClick={() => setShowVerifyModal(false)}
                className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors'
                aria-label='Close'
              >
                <X size={24} />
              </button>

              <div className='mb-2 flex justify-center'>
                <img
                  src={emailImg}
                  alt='Email verification'
                  className='w-52 h-52 object-contain'
                  loading='eager'
                />
              </div>

              <h2 className='text-2xl font-bold font-orbitron mb-2 text-gray-800'>
                Verify Your Account!
              </h2>
              
              <p className='text-gray-600 mb-6 leading-relaxed text-base px-10'>
                We’ve sent a verification link to your email to complete your registration for 
                <span className='font-bold text-blue-800'> RoboRent</span>
                . If you don’t see the email, check your spam folder or 
                <span className='font-bold hover:underline cursor-pointer'> request a new link.</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}