import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  DollarSign, 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  CheckCircle 
} from 'lucide-react';
import { api } from '../App';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    total_students: 0,
    total_fees_collected: 0,
    pending_fees: 0,
    pending_payments_count: 0,
    total_expenses: 0,
    net_revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/summary');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ title, value, icon: Icon, color, description, trend }) => (
    <Card className="hover-lift animate-fadeIn">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {loading ? (
            <div className="loading-spinner" />
          ) : (
            value
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-600 font-medium">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-slideIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Finance Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of college financial operations and student management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            System Online
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Students"
          value={dashboardData.total_students}
          icon={Users}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          description="Registered students"
        />
        
        <StatCard
          title="Fees Collected"
          value={formatCurrency(dashboardData.total_fees_collected)}
          icon={DollarSign}
          color="bg-gradient-to-r from-green-500 to-green-600"
          description="Total revenue collected"
          trend="+12% from last month"
        />
        
        <StatCard
          title="Pending Fees"
          value={formatCurrency(dashboardData.pending_fees)}
          icon={AlertCircle}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
          description={`${dashboardData.pending_payments_count} pending payments`}
        />
        
        <StatCard
          title="Total Expenses"
          value={formatCurrency(dashboardData.total_expenses)}
          icon={TrendingUp}
          color="bg-gradient-to-r from-red-500 to-red-600"
          description="Operational expenses"
        />
        
        <StatCard
          title="Net Revenue"
          value={formatCurrency(dashboardData.net_revenue)}
          icon={CreditCard}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          description="Revenue minus expenses"
          trend={dashboardData.net_revenue > 0 ? "+ve cash flow" : "Review required"}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Student Management
            </CardTitle>
            <CardDescription>
              Manage student records and fee assignments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">Active Students</span>
              <Badge className="bg-blue-100 text-blue-800">
                {dashboardData.total_students}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium">Pending Payments</span>
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                {dashboardData.pending_payments_count}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Financial Overview
            </CardTitle>
            <CardDescription>
              Revenue and expense tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Collection Rate</span>
              <Badge className="bg-green-100 text-green-800">
                {dashboardData.total_fees_collected > 0 ? 
                  `${Math.round((dashboardData.total_fees_collected / (dashboardData.total_fees_collected + dashboardData.pending_fees)) * 100)}%` 
                  : '0%'
                }
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium">Profit Margin</span>
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                {dashboardData.total_fees_collected > 0 ? 
                  `${Math.round((dashboardData.net_revenue / dashboardData.total_fees_collected) * 100)}%` 
                  : '0%'
                }
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>College Resource Planning System is operational</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Database</p>
                <p className="text-sm text-green-600">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">API Services</p>
                <p className="text-sm text-blue-600">Running</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">Backup</p>
                <p className="text-sm text-purple-600">Scheduled</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;