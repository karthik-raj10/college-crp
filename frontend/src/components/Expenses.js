import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Plus, TrendingDown, IndianRupee, Calendar, Building, Settings, Wrench, ShoppingCart } from 'lucide-react';
import { api } from '../App';
import { toast } from 'sonner';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    vendor: ''
  });

  const expenseCategories = [
    { value: 'infrastructure', label: 'Infrastructure', icon: Building, color: 'bg-blue-500' },
    { value: 'salaries', label: 'Salaries', icon: TrendingDown, color: 'bg-green-500' },
    { value: 'utilities', label: 'Utilities', icon: Settings, color: 'bg-yellow-500' },
    { value: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'bg-orange-500' },
    { value: 'equipment', label: 'Equipment', icon: ShoppingCart, color: 'bg-purple-500' },
    { value: 'miscellaneous', label: 'Miscellaneous', icon: TrendingDown, color: 'bg-gray-500' }
  ];

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory]);

  const fetchExpenses = async () => {
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      
      const response = await api.get('/expenses', { params });
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', {
        ...formData,
        amount: parseFloat(formData.amount),
        expense_date: new Date(formData.expense_date).toISOString()
      });
      toast.success('Expense recorded successfully!');
      setIsDialogOpen(false);
      setFormData({
        title: '',
        category: '',
        amount: '',
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
        vendor: ''
      });
      fetchExpenses();
    } catch (error) {
      console.error('Error recording expense:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCategoryInfo = (category) => {
    return expenseCategories.find(cat => cat.value === category) || expenseCategories[expenseCategories.length - 1];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  return (
    <div className="space-y-6 animate-slideIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Expense Management</h1>
          <p className="text-gray-600 mt-1">Track and manage college operational expenses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Record New Expense</DialogTitle>
              <DialogDescription>
                Add a new operational expense to the system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Expense Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Monthly Electricity Bill"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <category.icon className="w-4 h-4" />
                          {category.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="15000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense_date">Expense Date *</Label>
                  <Input
                    id="expense_date"
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => handleInputChange('expense_date', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor/Supplier</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => handleInputChange('vendor', e.target.value)}
                  placeholder="e.g., ABC Electronics Pvt Ltd"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Additional details about this expense..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-gradient">
                  Record Expense
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <TrendingDown className="w-5 h-5" />
            Total Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-red-600" />
            <span className="text-3xl font-bold text-red-600">
              {formatCurrency(getTotalExpenses()).replace('₹', '')}
            </span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            {selectedCategory ? 
              `${expenseCategories.find(c => c.value === selectedCategory)?.label} expenses` : 
              `${expenses.length} total expense records`
            }
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <Label htmlFor="category-filter">Filter by Category:</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <category.icon className="w-4 h-4" />
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="loading-spinner" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {expenses.map((expense) => {
            const categoryInfo = getCategoryInfo(expense.category);
            const IconComponent = categoryInfo.icon;
            
            return (
              <Card key={expense.id} className="hover-lift animate-fadeIn">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${categoryInfo.color} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{expense.title}</CardTitle>
                        <CardDescription>{categoryInfo.label}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4 text-red-600" />
                        <span className="text-xl font-bold text-red-600">
                          {formatCurrency(expense.amount).replace('₹', '')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
                  </div>
                  
                  {expense.vendor && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Vendor:</span> {expense.vendor}
                    </div>
                  )}
                  
                  {expense.description && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">{expense.description}</p>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      Added: {new Date(expense.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && expenses.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-500 mb-4">
              {selectedCategory 
                ? 'No expenses found for this category' 
                : 'Get started by recording your first expense'
              }
            </p>
            {!selectedCategory && (
              <Button onClick={() => setIsDialogOpen(true)} className="btn-gradient">
                <Plus className="w-4 h-4 mr-2" />
                Record First Expense
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Expenses;