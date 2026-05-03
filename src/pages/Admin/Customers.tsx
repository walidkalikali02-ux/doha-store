import {useState} from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  ArrowUpDown,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  DollarSign,
  Calendar,
  Star,
} from 'lucide-react';
import {motion} from 'motion/react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  status: 'active' | 'inactive' | 'vip';
  location: string;
}

const statusConfig = {
  active: {bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Active'},
  inactive: {bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'Inactive'},
  vip: {bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'VIP'},
};

function StatusBadge({status}: {status: 'active' | 'inactive' | 'vip'}) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.text.replace('text-', 'bg-')}`} />
      {config.label}
    </span>
  );
}

export function AdminCustomers() {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const customers: Customer[] = [
    {
      id: '1',
      name: 'Ahmed Al-Rashid',
      email: 'ahmed@email.com',
      phone: '+974 1234 5678',
      orders: 12,
      totalSpent: 1540,
      lastOrder: 'Jan 15, 2024',
      status: 'vip',
      location: 'Doha, Qatar',
    },
    {
      id: '2',
      name: 'Fatima Hassan',
      email: 'fatima@email.com',
      phone: '+974 2345 6789',
      orders: 8,
      totalSpent: 890,
      lastOrder: 'Jan 15, 2024',
      status: 'active',
      location: 'Doha, Qatar',
    },
    {
      id: '3',
      name: 'Mohammed Khalil',
      email: 'mohammed@email.com',
      phone: '+974 3456 7890',
      orders: 15,
      totalSpent: 2340,
      lastOrder: 'Jan 14, 2024',
      status: 'vip',
      location: 'Al Wakrah, Qatar',
    },
    {
      id: '4',
      name: 'Sarah Al-Mansouri',
      email: 'sarah@email.com',
      phone: '+974 4567 8901',
      orders: 5,
      totalSpent: 450,
      lastOrder: 'Jan 14, 2024',
      status: 'active',
      location: 'Doha, Qatar',
    },
    {
      id: '5',
      name: 'Omar Fayed',
      email: 'omar@email.com',
      phone: '+974 5678 9012',
      orders: 3,
      totalSpent: 210,
      lastOrder: 'Jan 14, 2024',
      status: 'inactive',
      location: 'Al Khor, Qatar',
    },
    {
      id: '6',
      name: 'Layla Ibrahim',
      email: 'layla@email.com',
      phone: '+974 6789 0123',
      orders: 7,
      totalSpent: 780,
      lastOrder: 'Jan 13, 2024',
      status: 'active',
      location: 'Doha, Qatar',
    },
  ];

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId) ? prev.filter(id => id !== customerId) : [...prev, customerId]
    );
  };

  const toggleAllCustomers = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#000000]">Customers</h1>
          <p className="text-sm text-[#737373] mt-0.5">
            Manage your customer base and view their activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#737373] hover:text-[#000000] border border-[#e3e3e3] rounded-lg transition-colors hover:bg-white">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#000000] text-white rounded-lg font-medium text-sm hover:bg-[#333333] transition-colors">
            <Plus className="h-4 w-4" />
            Add customer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#e3e3e3] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f9f9f9] rounded-lg flex items-center justify-center">
              <Search className="h-5 w-5 text-[#3d2b1f]" />
            </div>
            <div>
              <p className="text-xs text-[#737373]">Total Customers</p>
              <p className="text-xl font-bold text-[#000000]">892</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e3e3e3] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-[#737373]">Active</p>
              <p className="text-xl font-bold text-[#000000]">756</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e3e3e3] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-[#737373]">VIP</p>
              <p className="text-xl font-bold text-[#000000]">136</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e3e3e3] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f9f9f9] rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-[#3d2b1f]" />
            </div>
            <div>
              <p className="text-xs text-[#737373]">Avg. Spend</p>
              <p className="text-xl font-bold text-[#000000]">$147</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-[#e3e3e3] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20 focus:border-[#c6a355] transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-[#e3e3e3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20 focus:border-[#c6a355]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="vip">VIP</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-[#737373] hover:text-[#000000] border border-[#e3e3e3] rounded-lg transition-colors hover:bg-[#f9f9f9]">
              <Filter className="h-4 w-4" />
              More filters
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <motion.div
        initial={{opacity: 0, y: 12}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.4, ease: 'easeOut'}}
        className="bg-white rounded-xl border border-[#e3e3e3] overflow-hidden"
      >
        {/* Bulk Actions */}
        {selectedCustomers.length > 0 && (
          <div className="px-5 py-3 border-b border-[#e5e5e5] bg-[#f9f9f9] flex items-center justify-between">
            <span className="text-sm font-medium text-[#000000]">
              {selectedCustomers.length} selected
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm font-medium text-[#737373] hover:text-[#000000] hover:bg-white rounded border border-[#e3e3e3] transition-colors">
                Send email
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-[#737373] hover:text-[#000000] hover:bg-white rounded border border-[#e3e3e3] transition-colors">
                Change status
              </button>
            </div>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e5e5] bg-[#f9f9f9]/50">
                <th className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.length === customers.length && customers.length > 0}
                    onChange={toggleAllCustomers}
                    className="rounded border-[#e3e3e3] text-[#c6a355] focus:ring-[#c6a355]"
                  />
                </th>
                <th className="text-left text-xs font-semibold text-[#737373] uppercase px-5 py-3">
                  <button className="flex items-center gap-1 hover:text-[#000000]">
                    Customer
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left text-xs font-semibold text-[#737373] uppercase px-5 py-3">
                  Contact
                </th>
                <th className="text-left text-xs font-semibold text-[#737373] uppercase px-5 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-semibold text-[#737373] uppercase px-5 py-3">
                  Orders
                </th>
                <th className="text-right text-xs font-semibold text-[#737373] uppercase px-5 py-3">
                  Total Spent
                </th>
                <th className="text-left text-xs font-semibold text-[#737373] uppercase px-5 py-3">
                  Last Order
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f2f2]">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="group hover:bg-[#f9f9f9] transition-colors">
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => toggleCustomerSelection(customer.id)}
                      className="rounded border-[#e3e3e3] text-[#c6a355] focus:ring-[#c6a355]"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#c6a355] to-[#3d2b1f] rounded-full flex items-center justify-center text-white font-semibold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#000000]">{customer.name}</p>
                        <div className="flex items-center gap-1 text-xs text-[#737373]">
                          <MapPin className="h-3 w-3" />
                          {customer.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm text-[#737373]">
                        <Mail className="h-3.5 w-3.5" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-[#737373]">
                        <Phone className="h-3.5 w-3.5" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={customer.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm font-bold text-[#000000]">{customer.orders}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm font-bold text-[#000000]">${customer.totalSpent}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-[#737373]">
                      <Calendar className="h-3.5 w-3.5" />
                      {customer.lastOrder}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <button className="p-1 text-[#737373] hover:text-[#000000] opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-[#f2f2f2]">
          {filteredCustomers.map(customer => (
            <div key={customer.id} className="p-4 hover:bg-[#f9f9f9]">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedCustomers.includes(customer.id)}
                  onChange={() => toggleCustomerSelection(customer.id)}
                  className="mt-1 rounded border-[#e3e3e3] text-[#c6a355] focus:ring-[#c6a355]"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#c6a355] to-[#3d2b1f] rounded-full flex items-center justify-center text-white font-semibold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#000000]">{customer.name}</p>
                        <StatusBadge status={customer.status} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#737373]">
                      <Mail className="h-3 w-3" />
                      {customer.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#737373]">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#f2f2f2]">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-[#737373]">
                        <ShoppingBag className="h-3 w-3" />
                        {customer.orders} orders
                      </div>
                      <div className="text-xs font-semibold text-[#000000]">
                        ${customer.totalSpent}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#737373]">
                      <Calendar className="h-3 w-3" />
                      {customer.lastOrder}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-[#f9f9f9] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-[#737373]" />
            </div>
            <h3 className="text-base font-semibold text-[#000000] mb-1">No customers found</h3>
            <p className="text-sm text-[#737373]">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-[#e5e5e5] bg-[#f9f9f9]/30 flex items-center justify-between">
          <span className="text-xs text-[#737373]">
            Showing {filteredCustomers.length} of {customers.length} customers
          </span>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 text-xs font-medium text-[#737373] hover:text-[#000000] border border-[#e3e3e3] rounded hover:bg-white transition-colors disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-[#000000] bg-white border border-[#e3e3e3] rounded hover:bg-[#f9f9f9] transition-colors">
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
