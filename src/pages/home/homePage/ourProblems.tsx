import { DollarSign, Phone, TrendingUp } from 'lucide-react'
import { useState } from 'react'

const OurProblems = () => {
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
      icon: TrendingUp
    },
    {
      title: 'Manual Processes',
      description: 'Current rental processes rely on fragmented phone calls and emails, lacking centralized booking and management systems.',
      icon: Phone
    },
    {
      title: 'Unclear Pricing & Availability',
      description: 'Clients often receive inconsistent quotes and have no way to check real-time availability, making planning stressful and uncertain.',
      icon: DollarSign
    }
  ]

  return (
    <div className='relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-6 overflow-hidden'>
      <div className='max-w-7xl mx-auto p-8 py-10 mt-4'>
        <div className='mb-6 text-center' data-aos='fade-down'>
          <p className='inline-block text-lg font-medium text-emerald-400 tracking-wide mb-4 border border-emerald-500 rounded-full px-4 py-1 bg-gray-800'>
            ABOUT US
          </p>
        </div>
        <h1 className='text-[2.5rem] font-bold mb-5 -mt-4 leading-[1.1]' data-aos='fade-down'>
          <span className='text-emerald-300'>THE PROBLEM</span>
        </h1>

        <div className='grid md:grid-cols-3 gap-6 mb-12'>
          {problems.map((problem, index) => (
            <div 
              key={index}
              className='bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 p-6 rounded-2xl border-2 border-emerald-800 hover:border-emerald-600 transition-all hover:shadow-lg'
              data-aos='fade-right'
              data-aos-delay={index * 100}
            >
              <div className='flex items-start gap-4 mb-4'>
                <div className='flex-shrink-0 mt-1'>
                  <problem.icon className='w-8 h-8 text-emerald-400' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-xl font-bold text-emerald-300 mb-2'>{problem.title}</h3>
                  <p className='text-gray-300 leading-relaxed'>{problem.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='bg-gradient-to-r from-emerald-900/30 via-emerald-800/20 to-emerald-900/30 p-6 rounded-2xl border-2 border-emerald-700' data-aos='fade-up'>
          <p className='text-lg text-gray-300 leading-relaxed text-center max-w-4xl mx-auto'>
            <span className='font-bold text-emerald-300'>The robotics industry faces a critical challenge:</span> businesses need advanced automation but cannot afford the upfront costs, maintenance burden, and inflexibility of robot ownership.
          </p>
        </div>
      </div>

      <div className='max-w-7xl mx-auto p-8 py-12 pb-32'>
        <div className='flex gap-12 items-start'>
          <div className='flex-1'>
            <h1 className='font-bold mb-5 leading-[1.1]' data-aos='fade-right'>
              <span className='text-emerald-400 text-3xl ml-4'>OUR SOLUTION:</span>
              <br />
                <span className='text-emerald-300 text-[3rem] ml-14'>ROBORENT</span>
            </h1>

            <p className='text-lg text-gray-300 mb-8 leading-relaxed text-left max-w-[38rem] ml-[6rem]' data-aos='fade-right' data-aos-delay='100'>
              We recognize the importance of innovation in the robotics industry and take our role in assisting businesses seriously. We are dedicated to providing our users with the best possible tools and support.
            </p>

            <div className='w-2/3 h-px mx-auto bg-gradient-to-r from-emerald-400 via-gray-700 to-emerald-300 my-6' data-aos='fade-right' data-aos-delay='200' />

            <div className='flex flex-col items-center justify-center text-center gap-6 mt-8' data-aos='fade-right' data-aos-delay='300'>
              <div className='flex flex-wrap justify-center gap-2'>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-2 rounded-full font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <p className='text-lg text-gray-300 leading-relaxed max-w-xl text-left'>
                {currentTab?.content}
              </p>
            </div>
          </div>

          <div className='w-96 h-96 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl flex items-center justify-center flex-shrink-0' data-aos='fade-left' data-aos-delay='150'>
            <img
              src={currentTab?.img}
              alt={currentTab?.label}
              className='w-full h-full object-cover rounded-3xl'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default OurProblems