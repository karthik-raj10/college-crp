import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Receipt, 
  TrendingDown,
  GraduationCap
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-blue-600'
    },
    {
      id: 'students',
      label: 'Students',
      icon: Users,
      color: 'text-green-600'
    },
    {
      id: 'fee-structures',
      label: 'Fee Structures',
      icon: CreditCard,
      color: 'text-purple-600'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: Receipt,
      color: 'text-blue-500'
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: TrendingDown,
      color: 'text-red-500'
    }
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen sticky top-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">CRP System</h1>
            <p className="text-xs text-gray-500">College Resource Planning</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border-l-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : item.color}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
          <p className="text-sm text-gray-600 mb-2">Finance Overview</p>
          <div className="flex justify-between text-xs">
            <span className="text-green-600 font-semibold">Revenue</span>
            <span className="text-blue-600 font-semibold">Analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;