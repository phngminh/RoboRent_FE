import { useState } from 'react'
import Layout from '../../components/layout'

export default function AboutUs() {
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

  return (
    <Layout>
      <div className='min-h-screen w-full overflow-hidden'>
        <div className='max-w-7xl mx-auto p-8 py-10 mt-8'>
          <h1 className='text-[2.5rem] font-bold mb-5 leading-[1.1]' data-aos='fade-down'>
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

                {/* <div className='flex items-start gap-2'>
                  <input type='checkbox' className='mt-2' />
                  <p className='text-black'>
                    You agree to our friendly <a href='#' className='underline'>privacy policy</a>.
                  </p>
                </div> */}

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
      </div>
    </Layout>
  )
}