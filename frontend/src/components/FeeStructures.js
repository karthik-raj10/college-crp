import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Plus, CreditCard, IndianRupee, BookOpen, Home, FlaskConical } from 'lucide-react';
import { api } from '../App';
import { toast } from 'sonner';

const FeeStructures = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    fee_type: '',
    amount: '',
    academic_year: '',
    description: ''
  });

  const feeTypes = [
    { value: 'tuition', label: 'Tuition Fee', icon: BookOpen, color: 'bg-blue-500' },
    { value: 'hostel', label: 'Hostel Fee', icon: Home, color: 'bg-green-500' },
    { value: 'lab', label: 'Lab Fee', icon: FlaskConical, color: 'bg-purple-500' },
    { value: 'library', label: 'Library Fee', icon: BookOpen, color: 'bg-orange-500' },
    { value: 'exam', label: 'Exam Fee', icon: CreditCard, color: 'bg-red-500' },
    { value: 'miscellaneous', label: 'Miscellaneous', icon: CreditCard, color: 'bg-gray-500' }
  ];

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const fetchFeeStructures = async () => {
    try {
      const response = await api.get('/fee-structures');
      setFeeStructures(response.data);
    } catch (error) {
      console.error('Error fetching fee structures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fee-structures', {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success('Fee structure created successfully!');
      setIsDialogOpen(false);
      setFormData({
        name: '',
        fee_type: '',
        amount: '',
        academic_year: '',
        description: ''
      });
      fetchFeeStructures();
    } catch (error) {
      console.error('Error creating fee structure:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getFeeTypeInfo = (type) => {
    return feeTypes.find(ft => ft.value === type) || feeTypes[feeTypes.length - 1];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-slideIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Fee Structures</h1>
          <p className="text-gray-600 mt-1">Manage fee categories and amounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Create Fee Structure
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Fee Structure</DialogTitle>
              <DialogDescription>
                Define a new fee category and amount for students.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Fee Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Semester 1 Tuition Fee"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fee_type">Fee Type *</Label>
                <Select value={formData.fee_type} onValueChange={(value) => handleInputChange('fee_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee type" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
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
                    placeholder="50000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academic_year">Academic Year *</Label>
                  <Input
                    id="academic_year"
                    value={formData.academic_year}
                    onChange={(e) => handleInputChange('academic_year', e.target.value)}
                    placeholder="2024-25"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Additional details about this fee..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-gradient">
                  Create Fee Structure
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Fee Structures Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="loading-spinner" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {feeStructures.map((fee) => {
            const typeInfo = getFeeTypeInfo(fee.fee_type);
            const IconComponent = typeInfo.icon;
            
            return (
              <Card key={fee.id} className="hover-lift animate-fadeIn">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${typeInfo.color} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{fee.name}</CardTitle>
                        <CardDescription>{typeInfo.label}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {fee.academic_year}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Amount</span>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4 text-green-600" />
                      <span className="text-xl font-bold text-green-600">
                        {formatCurrency(fee.amount).replace('₹', '')}
                      </span>
                    </div>
                  </div>
                  
                  {fee.description && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">{fee.description}</p>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      Created: {new Date(fee.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && feeStructures.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No fee structures found</h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first fee structure
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="btn-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Create First Fee Structure
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeeStructures;