import { useState, useEffect } from 'react'
import { ArrowRight, Calendar, Monitor, Sparkles, X, Zap } from 'lucide-react'
import HowItWorks from './howItWorks'
import RobotCarousel from './robotCarousel'
import emailImg from  '../../../assets/email.jpg'
import Layout from '../../../components/layout'

export default function Home() {
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [activeTab, setActiveTab] = useState('platform')
  const tabs = [
    {
      id: 'platform',
      label: 'Integrated Platform',
      img: 'https://applet.io/images/blog/best-integration-platform.png?v=1680096878164245470',
      content:
        'Centralized online system for booking, customization, and management of rental robots.',
    },
    {
      id: 'custom',
      label: 'Robot Customization',
      img: 'https://www.purshology.com/wp-content/uploads/2022/04/Product-Customization-Benefits-Examples-Tips-customersupport-supporticket.png',
      content:
        'Robots can be tailored to meet specific business or industrial requirements, providing flexibility and precision.',
    },
    {
      id: 'monitoring',
      label: 'Real-time Monitoring',
      img: 'https://img.freepik.com/free-vector/guard-service-man-sitting-control-panel-watching-surveillance-camera-videos-monitors-cctv-control-room-vector-illustration-security-system-worker-spying-supervision-concept_74855-10077.jpg?semt=ais_hybrid&w=740&q=80',
      content:
        'Track and monitor robots during deployment, enhancing operational efficiency and user experience.',
    },
  ]
  const currentTab = tabs.find(tab => tab.id === activeTab)
  const problems = [
    {
      title: 'Growing Robot Adoption',
      description: 'Robots increasingly used in conferences, exhibitions, weddings, and product launches for entertainment and brand promotion.',
      icon: '💰'
    },
    {
      title: 'Manual Processes',
      description: 'Current rental processes rely on fragmented phone calls and emails, lacking centralized booking and management systems.',
      icon: '🔒'
    },
    {
      title: 'Maintenance Complexity',
      description: 'Robot ownership requires specialized technical expertise and ongoing maintenance costs that many businesses cannot sustain.',
      icon: '⚙️'
    }
  ]

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
        <section id='home'>
          <HowItWorks />

          <div className='min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 p-8'>
            <div className='max-w-6xl mx-auto mt-4'>
              <div className='mb-6' data-aos='fade-down'>
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
                      <div className='group bg-gray-50 rounded-3xl p-8 animate-in slide-in-from-left-8 fade-in transition-all duration-150 hover:shadow-xl hover:-translate-y-1 border-2 border-gray-200 hover:border-gray-500' data-aos='fade-right' data-aos-delay='100'>
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

                      <div className='group bg-gray-50 rounded-3xl p-8 animate-in slide-in-from-left-8 fade-in delay-200 transition-all duration-150 hover:shadow-xl hover:-translate-y-1 border-2 border-gray-200 hover:border-gray-500' data-aos='fade-right' data-aos-delay='200'>
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

                    <div className='group bg-gray-50 rounded-3xl p-8 animate-in slide-in-from-left-8 fade-in delay-300 transition-all duration-150 hover:shadow-xl hover:-translate-y-1 border-2 border-gray-200 hover:border-gray-500' data-aos='fade-right' data-aos-delay='300'>
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

                <div className='bg-blue-900 max-w-[400px] w-full mx-auto rounded-3xl p-8 text-white animate-in slide-in-from-right-8 fade-in duration-700 delay-100' data-aos='fade-left' data-aos-delay='150'>
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
        </section>

        <section id='our-products' className='min-h-screen w-full'>
          <RobotCarousel />
        </section>

        <section id='about-us' className='min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 w-full overflow-hidden'>
          <div className='max-w-7xl mx-auto p-8 py-10 mt-8'>
            <div className='mb-6 text-center' data-aos='fade-down'>
              <p className='inline-block text-lg font-medium text-gray-600 tracking-wide mb-4 border border-gray-500 rounded-full px-4 py-1 bg-white'>
                ABOUT US
              </p>
            </div>
            <h1 className='text-[2.5rem] font-bold mb-5 -mt-4 leading-[1.1]' data-aos='fade-down'>
              <span className='text-blue-900'>THE PROBLEM</span>
            </h1>

            <div className='grid md:grid-cols-3 gap-6 mb-12'>
              {problems.map((problem, index) => (
                <div 
                  key={index}
                  className='bg-gradient-to-br from-teal-50 to-blue-50 p-6 rounded-2xl border-2 border-teal-200 hover:border-blue-300 transition-all hover:shadow-lg'
                  data-aos='fade-right'
                  data-aos-delay={index * 100}
                >
                  <div className='text-4xl mb-4'>{problem.icon}</div>
                  <h3 className='text-xl font-bold text-blue-900 mb-3'>{problem.title}</h3>
                  <p className='text-gray-700 leading-relaxed'>{problem.description}</p>
                </div>
              ))}
            </div>

            <div className='bg-gradient-to-r from-teal-100 via-blue-50 to-teal-100 p-6 rounded-2xl border-2 border-blue-200' data-aos='fade-up'>
              <p className='text-lg text-gray-800 leading-relaxed text-center max-w-4xl mx-auto'>
                <span className='font-bold text-blue-900'>The robotics industry faces a critical challenge:</span> businesses need advanced automation but cannot afford the upfront costs, maintenance burden, and inflexibility of robot ownership. This creates a barrier to innovation and growth.
              </p>
            </div>
          </div>

          <div className='max-w-7xl mx-auto p-8 py-12'>
            <div className='flex gap-12 items-start'>
              <div className='flex-1'>
                <h1 className='font-bold mb-5 leading-[1.1]' data-aos='fade-right'>
                  <span className='text-teal-400 text-3xl mr-44'>OUR SOLUTION:</span>
                  <br />
                    <span className='text-blue-900 text-[3rem] ml-14'>ROBORENT</span>
                </h1>

                <p className='text-lg text-gray-600 mb-8 leading-relaxed text-left max-w-[38rem] ml-[6rem]' data-aos='fade-right' data-aos-delay='100'>
                  We recognize the importance of innovation in the robotics industry and take our role in assisting businesses seriously. We are dedicated to providing our users with the best possible tools and support.
                </p>

                <div className='w-2/3 h-px mx-auto bg-gradient-to-r from-teal-400 via-gray-300 to-blue-900 my-6' data-aos='fade-right' data-aos-delay='200' />

                <div className='flex flex-col items-center justify-center text-center gap-6 mt-8' data-aos='fade-right' data-aos-delay='300'>
                  <div className='flex flex-wrap justify-center gap-2'>
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-2 rounded-full font-medium transition ${
                          activeTab === tab.id
                            ? 'bg-blue-900 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <p className='text-lg text-gray-700 leading-relaxed max-w-xl text-left'>
                    {currentTab?.content}
                  </p>
                </div>
              </div>

              <div className='w-96 h-96 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center flex-shrink-0' data-aos='fade-left' data-aos-delay='150'>
                <img
                  src={currentTab?.img}
                  alt={currentTab?.label}
                  className='w-full h-full object-cover rounded-3xl'
                />
              </div>
            </div>
          </div>

          <div className='w-full bg-white py-14 px-8'>
            <div className='bg-gradient-to-br from-teal-200 to-teal-400 py-10 rounded-3xl max-w-2xl mx-auto' data-aos='fade-up'>
              <div className='max-w-xl mx-auto'>
                <h2 className='text-4xl font-bold font-orbitron mb-2 text-blue-900'>Contact us</h2>
                <p className='text-blue-900 mb-6 text-lg'>Reach out and we'll get in touch within 24 hours.</p>

                <form className='space-y-6'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block font-medium mb-2 text-left text-blue-900'>First name</label>
                      <input
                        type='text'
                        placeholder='First name'
                        className='w-full px-4 py-3 rounded-lg border-none outline-none'
                      />
                    </div>
                    <div>
                      <label className='block font-medium mb-2 text-left text-blue-900'>Last name</label>
                      <input
                        type='text'
                        placeholder='Last name'
                        className='w-full px-4 py-3 rounded-lg border-none outline-none'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block font-medium mb-2 text-left text-blue-900'>Email</label>
                    <input
                      type='email'
                      placeholder='Email address'
                      className='w-full px-4 py-3 rounded-lg border-none outline-none'
                    />
                  </div>

                  <div>
                    <label className='block font-medium mb-2 text-left text-blue-900'>Message</label>
                    <textarea
                      placeholder='Leave us a message...'
                      rows={4}
                      className='w-full px-4 py-3 rounded-lg border-none outline-none resize-none'
                    ></textarea>
                  </div>

                  <button
                    type='submit'
                    className='w-full bg-blue-800 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition'
                  >
                    Send message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

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