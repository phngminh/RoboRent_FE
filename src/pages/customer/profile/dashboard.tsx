import React from 'react'
import { CreditCard, Download } from 'lucide-react'

const DashboardContent: React.FC = () => {
  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          <h3 className='text-sm font-medium text-gray-600 mb-2'>Total Requests</h3>
          <p className='text-3xl font-bold text-blue-600'>12</p>
        </div>
        
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          <h3 className='text-sm font-medium text-gray-600 mb-2'>Upcoming Payments</h3>
          <p className='text-3xl font-bold text-blue-600 mb-3'>$750</p>
          <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
            Make Payment
          </button>
        </div>
        
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          <h3 className='text-sm font-medium text-gray-600 mb-2'>Total Deposits</h3>
          <p className='text-3xl font-bold text-blue-600'>$3,200</p>
        </div>
      </div>

      {/* Rental Requests Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
        <div className='p-6 border-b border-gray-100'>
          <h2 className='text-xl font-semibold text-gray-800'>Completed Rental Requests</h2>
          <p className='text-gray-600 mt-1'>Review the details of your past rental agreements and manage contracts.</p>
        </div>
        
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Rental ID</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Item</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Payment Status</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Amount</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Date</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {[
                { id: 'RNT001', item: 'Autonomous Delivery Drone', status: 'Paid', amount: '$1,200', date: '2023-10-26', statusColor: 'bg-green-100 text-green-800' },
                { id: 'RNT002', item: 'Robotic Vacuum Cleaner', status: 'Pending', amount: '$350', date: '2023-11-15', statusColor: 'bg-blue-100 text-blue-800' },
                { id: 'RNT003', item: 'Automated Gardening System', status: 'Paid', amount: '$800', date: '2023-09-01', statusColor: 'bg-green-100 text-green-800' },
                { id: 'RNT004', item: 'Warehouse Inventory Robot', status: 'Overdue', amount: '$2,500', date: '2023-12-01', statusColor: 'bg-red-100 text-red-800' },
                { id: 'RNT005', item: 'Interactive Kiosk Robot', status: 'Paid', amount: '$600', date: '2023-10-05', statusColor: 'bg-green-100 text-green-800' },
              ].map((rental) => (
                <tr key={rental.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{rental.id}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{rental.item}</td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${rental.statusColor}`}>
                      {rental.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{rental.amount}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{rental.date}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <div className='flex space-x-2'>
                      {rental.status === 'Pending' || rental.status === 'Overdue' ? (
                        <button className='bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1'>
                          <CreditCard size={14} />
                          <span>Pay Now</span>
                        </button>
                      ) : null}
                      <button className='bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1'>
                        <Download size={14} />
                        <span>Download</span>
                      </button>
                      <button className='text-gray-600 hover:text-gray-800 transition-colors'>Review</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className='px-6 py-4 border-t border-gray-100 flex items-center justify-between'>
          <div className='flex space-x-2'>
            <button className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors'>Previous</button>
            <button className='px-3 py-1 text-sm bg-blue-600 text-white rounded'>1</button>
            <button className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors'>2</button>
            <button className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors'>3</button>
            <button className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors'>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardContent