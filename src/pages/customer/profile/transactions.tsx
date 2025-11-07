import React from 'react'
import { Search, CheckCircle, Clock, XCircle } from 'lucide-react'

const TransactionsContent: React.FC = () => {
  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
        <h2 className='text-lg font-semibold text-gray-800 mb-4'>Filter Transactions</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Date From</label>
            <input 
              type='date'
              placeholder='YYYY-MM-DD'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Date To</label>
            <input 
              type='date'
              placeholder='YYYY-MM-DD'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Type</label>
            <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
              <option>All Types</option>
              <option>Payment</option>
              <option>Refund</option>
              <option>Deposit</option>
              <option>Withdrawal</option>
            </select>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
            <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
              <option>All Statuses</option>
              <option>Completed</option>
              <option>Pending</option>
              <option>Failed</option>
            </select>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Amount Range: $0 - $2000</label>
            <div className='relative'>
              <input 
                type='range'
                min='0'
                max='2000'
                className='w-full'
              />
              <div className='flex justify-between text-xs text-gray-500 mt-1'>
                <span>$0</span>
                <span>$2000</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Search</label>
            <div className='relative'>
              <Search size={16} className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <input 
                type='text'
                placeholder='Order Code or Description'
                className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>
        </div>

        <div className='flex space-x-3'>
          <button className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
            Apply Filters
          </button>
          <button className='bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors'>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
        <div className='p-6 border-b border-gray-100'>
          <h2 className='text-xl font-semibold text-gray-800'>Latest Transactions</h2>
        </div>
        
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Order Code</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Description</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Amount</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Created At</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {[
                { 
                  code: 'TXN12345678', 
                  description: 'Online purchase at TechStore', 
                  amount: '$120.50', 
                  status: 'Completed',
                  date: '2024-07-20 10:30 AM',
                  statusColor: 'bg-green-100 text-green-800',
                  statusIcon: CheckCircle
                },
                { 
                  code: 'TXN12345679', 
                  description: 'Subscription renewal for CloudService', 
                  amount: '$50.00', 
                  status: 'Pending',
                  date: '2024-07-19 03:15 PM',
                  statusColor: 'bg-yellow-100 text-yellow-800',
                  statusIcon: Clock
                },
                { 
                  code: 'TXN12345680', 
                  description: 'Refund for returned item (Gadget)', 
                  amount: '$75.25', 
                  status: 'Completed',
                  date: '2024-07-18 11:00 AM',
                  statusColor: 'bg-green-100 text-green-800',
                  statusIcon: CheckCircle
                },
                { 
                  code: 'TXN12345681', 
                  description: 'International money transfer', 
                  amount: '$500.00', 
                  status: 'Failed',
                  date: '2024-07-17 08:45 AM',
                  statusColor: 'bg-red-100 text-red-800',
                  statusIcon: XCircle
                },
                { 
                  code: 'TXN12345682', 
                  description: 'Utility bill payment', 
                  amount: '$85.70', 
                  status: 'Completed',
                  date: '2024-07-16 02:00 PM',
                  statusColor: 'bg-green-100 text-green-800',
                  statusIcon: CheckCircle
                },
                { 
                  code: 'TXN12345683', 
                  description: 'Mobile data top-up', 
                  amount: '$15.00', 
                  status: 'Completed',
                  date: '2024-07-15 09:00 AM',
                  statusColor: 'bg-green-100 text-green-800',
                  statusIcon: CheckCircle
                },
                { 
                  code: 'TXN12345684', 
                  description: 'Restaurant bill', 
                  amount: '$65.40', 
                  status: 'Completed',
                  date: '2024-07-14 07:00 PM',
                  statusColor: 'bg-green-100 text-green-800',
                  statusIcon: CheckCircle
                },
                { 
                  code: 'TXN12345685', 
                  description: 'Cash withdrawal ATM', 
                  amount: '$100.00', 
                  status: 'Completed',
                  date: '2024-07-13 01:00 PM',
                  statusColor: 'bg-green-100 text-green-800',
                  statusIcon: CheckCircle
                },
              ].map((transaction) => {
                const StatusIcon = transaction.statusIcon
                return (
                  <tr key={transaction.code} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{transaction.code}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{transaction.description}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{transaction.amount}</td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center space-x-2'>
                        <StatusIcon size={16} />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.statusColor}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{transaction.date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className='px-6 py-4 border-t border-gray-100 flex items-center justify-between'>
          <div className='flex space-x-2'>
            <button className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors'>&lt; Previous</button>
            <button className='px-3 py-1 text-sm bg-blue-600 text-white rounded'>1</button>
            <button className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors'>2</button>
            <button className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors'>3</button>
            <button className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors'>Next &gt;</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionsContent