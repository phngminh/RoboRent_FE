import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className='bg-gray-900 text-gray-300 border-t border-gray-800'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-10'>
          <div>
            <div className='flex items-center mb-4'>
              <span className='bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-3xl font-semibold font-orbitron tracking-wide'>RoboRent</span>
            </div>
            <p className='text-left text-sm leading-6'>
              Smart business solutions for modern teams. Rent, manage, and optimize your robotics fleet with ease.
            </p>
          </div>

          <div>
            <h4 className='text-white font-semibold mb-4 font-orbitron'>Company</h4>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link to='/' className='hover:text-white transition-colors'>Home</Link>
              </li>
              <li>
                <a href='#' className='hover:text-white transition-colors'>About Us</a>
              </li>
              <li>
                <a href='#' className='hover:text-white transition-colors'>Products</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='text-white font-semibold mb-4 font-orbitron'>Resources</h4>
            <ul className='space-y-3 text-sm'>
              <li>
                <a href='#' className='hover:text-white transition-colors'>Blog</a>
              </li>
              <li>
                <a href='#' className='hover:text-white transition-colors'>Pricing</a>
              </li>
              <li>
                <a href='#' className='hover:text-white transition-colors'>FAQs</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='text-white font-semibold mb-4 font-orbitron'>Stay up to date</h4>
            <p className='text-sm mb-4'>Join our newsletter for updates and product news.</p>
            <form className='flex flex-col sm:flex-row gap-3'>
              <div className='relative flex-1'>
                <input
                  type='email'
                  placeholder='Your email address'
                  className='w-full bg-gray-800 text-gray-100 placeholder-gray-500 rounded-md py-2 pl-10 pr-4 outline-none border border-gray-700 focus:border-blue-500 transition-colors'
                />
                <Mail size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' />
              </div>
              <button type='button' className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 duration-300 transform hover:scale-105 text-white font-semibold px-4 py-2 rounded-md transition-colors'>
                <Mail size={16} />
              </button>
            </form>
            <div className='mt-6 space-y-2 text-sm'>
              <div className='flex items-center space-x-2'>
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className='flex items-center space-x-2'>
                <MapPin size={16} />
                <span>123 Innovation Way, San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='border-t border-gray-800'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-sm'>
          <p className='text-gray-400'>© {year} RoboRent. All rights reserved.</p>
          <div className='flex items-center space-x-6 mt-3 sm:mt-0'>
            <a href='#' className='text-gray-400 hover:text-white transition-colors'>Privacy Policy</a>
            <a href='#' className='text-gray-400 hover:text-white transition-colors'>Terms of Service</a>
            <a href='#' className='text-gray-400 hover:text-white transition-colors'>Security</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer