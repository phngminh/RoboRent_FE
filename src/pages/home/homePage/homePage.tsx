import { useState, useEffect } from 'react'
import { Calendar, Monitor, Sparkles, X, Zap } from 'lucide-react'
import HowItWorks from './howItWorks'
import emailImg from  '../../../assets/email.png'
import loginImg from  '../../../assets/login_img.png'
import Layout from '../../../components/layout'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import OurProblems from './ourProblems'
import PackageDisplay from '../product/packageSection'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [requireLoginModal, setRequireLoginModal] = useState(false)

  useEffect(() => {
    const flag = localStorage.getItem('showVerifyModal')
    if (flag === 'true') {
      setShowVerifyModal(true)
      localStorage.removeItem('showVerifyModal')
    }
  }, [])

  const handleSendRequestClick = () => {
    const isLoggedIn = !!user

    if (!isLoggedIn) {
      setRequireLoginModal(true)
      return
    }

    navigate('/create-request')
  }

  return (
    <Layout>
      <div className='min-h-screen w-full overflow-hidden'>
        <section id='home'>
          <HowItWorks />

          <div className='min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-8'>
            <div className='max-w-6xl mx-auto mt-4'>
              <div className='mb-6' data-aos='fade-down'>
                <p className='inline-block text-lg font-medium text-emerald-200 tracking-wide mb-4 border border-emerald-500 rounded-full px-4 py-1 bg-gray-800'>
                  WHY CHOOSE US
                </p>
                <h1 className='text-[2.5rem] font-bold text-emerald-300'>
                  Why <span className='bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>RoboRent</span> is The Right Choice for You
                </h1>
              </div>

              <div className='grid grid-cols-[1.3fr_0.7fr] gap-6 mt-12 mb-10'>
                <div className='flex flex-col gap-6'>
                    <div className='grid grid-cols-2 gap-6'>
                      <div className='group bg-gray-800 rounded-3xl p-8 animate-in slide-in-from-left-8 fade-in transition-all duration-150 hover:shadow-xl hover:-translate-y-1 border-2 border-gray-700 hover:border-emerald-500' data-aos='fade-right' data-aos-delay='100'>
                        <div className='flex items-center gap-3 mb-4'>
                          <div className='w-11 h-11 flex-shrink-0 rounded-full border-2 border-emerald-400 flex items-center justify-center'>
                            <Sparkles className='w-6 h-6 text-emerald-400' />
                          </div>
                          <h2 className='text-2xl font-semibold text-emerald-300 whitespace-nowrap'>
                            Tailored Experiences
                          </h2>
                        </div>
                        <p className='text-gray-300 leading-relaxed text-left'>
                          Design your dream robot setup — from appearance and voice style to performance features. 
                          Our platform lets you personalize every detail so your event feels truly unique and unforgettable.
                        </p>
                      </div>

                      <div className='group bg-gray-800 rounded-3xl p-8 animate-in slide-in-from-left-8 fade-in delay-200 transition-all duration-150 hover:shadow-xl hover:-translate-y-1 border-2 border-gray-700 hover:border-emerald-500' data-aos='fade-right' data-aos-delay='200'>
                        <div className='flex items-center gap-3 mb-4'>
                          <div className='w-11 h-11 flex-shrink-0 rounded-full border-2 border-emerald-400 flex items-center justify-center'>
                            <Zap className='w-6 h-6 text-emerald-400' />
                          </div>
                          <h2 className='text-2xl font-semibold text-emerald-300 whitespace-nowrap'>
                            Real-Time Assistance
                          </h2>
                        </div>
                        <p className='text-gray-300 leading-relaxed text-left'>
                          Every rental includes a dedicated RoboRent staff member who chats with you to fine-tune 
                          your order and provides live support during the event — ensuring your robot performs flawlessly.
                        </p>
                      </div>
                    </div>

                    <div className='group bg-gray-800 rounded-3xl p-8 animate-in slide-in-from-left-8 fade-in delay-300 transition-all duration-150 hover:shadow-xl hover:-translate-y-1 border-2 border-gray-700 hover:border-emerald-500' data-aos='fade-right' data-aos-delay='300'>
                      <div className='flex items-center gap-3 mb-4'>
                        <div className='w-11 h-11 rounded-full border-2 border-emerald-400 flex items-center justify-center'>
                          <Monitor className='w-6 h-6 text-emerald-400' />
                        </div>
                        <h2 className='text-2xl font-semibold text-emerald-300'>
                          24/7 Event Monitoring
                        </h2>
                      </div>
                      <p className='text-gray-300 leading-relaxed text-left pl-8 pr-2'>
                        During your event, our support team monitors your robot remotely to handle 
                        updates, ensure smooth operation, and step in instantly if any technical issue occurs.
                      </p>
                  </div>
                </div>

                <div className='bg-emerald-600 max-w-[400px] w-full mx-auto rounded-3xl p-8 text-white animate-in slide-in-from-right-8 fade-in duration-700 delay-100' data-aos='fade-left' data-aos-delay='150'>
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
                    <button 
                      className='bg-transparent border-2 border-emerald-500 text-emerald-200 hover:bg-emerald-600 hover:text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105'
                      onClick={handleSendRequestClick}
                    >
                      Send A Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id='our-products' className='w-full'>
          <PackageDisplay />
        </section>

        <section id='about-us' className='min-h-screen w-full overflow-hidden'>
          <OurProblems />
        </section>

        <div className='bg-gradient-to-b from-gray-800 to-gray-900 py-12 px-6'>
          <div className='max-w-3xl mx-auto text-center'>
            <h2 className='text-3xl md:text-4xl font-bold text-emerald-200 mb-3 drop-shadow-sm'>
              Ready to Get Started?
            </h2>
            <p className='text-gray-200 text-base mb-8 max-w-xl mx-auto leading-relaxed'>
              Join thousands of businesses and individuals who trust RoboRent for their automation needs.
            </p>
            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
              <a 
                href='#our-products'
                className='bg-emerald-600 hover:bg-emerald-700 border-2 border-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105'
              >
                Browse All Robots
              </a>
              <button 
                className='bg-transparent border-2 border-emerald-500 text-emerald-300 hover:bg-emerald-600 hover:text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105'
                onClick={handleSendRequestClick}
              >
                Send A Request
              </button>
            </div>
          </div>
        </div>
        
        {showVerifyModal && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-300'>
            <div className='bg-gray-900 p-8 rounded-xl shadow-2xl text-center max-w-xl mx-4 relative border-2 border-emerald-600'>
              <button
                onClick={() => setShowVerifyModal(false)}
                className='absolute top-4 right-4 text-emerald-400 hover:text-emerald-300 transition-colors'
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

              <h2 className='text-2xl font-bold font-orbitron mb-2 text-emerald-500'>
                Verify Your Account!
              </h2>
              
              <p className='text-gray-300 mb-6 leading-relaxed text-base px-10'>
                We’ve sent a verification link to your email to complete your registration for 
                <span className='font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'> RoboRent</span>
                . If you don’t see the email, please check your spam folder.
              </p>
            </div>
          </div>
        )}

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
    </Layout>
  )
}