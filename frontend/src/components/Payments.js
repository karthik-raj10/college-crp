import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Plus, Receipt, IndianRupee, Calendar, CreditCard, Search } from 'lucide-react';
import { api } from '../App';
import { toast } from 'sonner';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentFeeRecords, setStudentFeeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    student_fee_record_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    transaction_id: '',
    notes: ''
  });

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'upi', label: 'UPI' },
    { value: 'card', label: 'Card' },
    { value: 'cheque', label: 'Cheque' }
  ];

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, [searchTerm]);

  const fetchPayments = async () => {
    try {
      const params = {};
      if (searchTerm) params.student_id = searchTerm;
      
      const response = await api.get('/payments', { params });
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStudentFeeRecords = async (studentId) => {
    try {
      const response = await api.get('/student-fee-records', {
        params: { student_id: studentId, status: 'pending' }
      });
      setStudentFeeRecords(response.data);
    } catch (error) {
      console.error('Error fetching student fee records:', error);
    }
  };

  const handleStudentChange = (studentId) => {
    setFormData(prev => ({
      ...prev,
      student_id: studentId,
      student_fee_record_id: ''
    }));
    if (studentId) {
      fetchStudentFeeRecords(studentId);
    } else {
      setStudentFeeRecords([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', {
        ...formData,
        amount: parseFloat(formData.amount),
        payment_date: new Date(formData.payment_date).toISOString()
      });
      toast.success('Payment recorded successfully!');
      setIsDialogOpen(false);
      setFormData({
        student_id: '',
        student_fee_record_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        transaction_id: '',
        notes: ''
      });
      setStudentFeeRecords([]);
      fetchPayments();
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentMethodBadge = (method) => {
    const colors = {
      cash: 'bg-green-100 text-green-800 border-green-200',
      bank_transfer: 'bg-blue-100 text-blue-800 border-blue-200',
      upi: 'bg-purple-100 text-purple-800 border-purple-200',
      card: 'bg-orange-100 text-orange-800 border-orange-200',
      cheque: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[method] || colors.cash;
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  return (
    <div className="space-y-6 animate-slideIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Payment Management</h1>
          <p className="text-gray-600 mt-1">Record and track student fee payments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
              <DialogDescription>
                Record a payment made by a student for their fees.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">Student *</Label>
                <Select value={formData.student_id} onValueChange={handleStudentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.student_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.student_id && (
                <div className="space-y-2">
                  <Label htmlFor="student_fee_record_id">Fee Record *</Label>
                  <Select 
                    value={formData.student_fee_record_id} 
                    onValueChange={(value) => handleInputChange('student_fee_record_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fee record" />
                    </SelectTrigger>
                    <SelectContent>
                      {studentFeeRecords.map((record) => (
                        <SelectItem key={record.id} value={record.id}>
                          Pending: ₹{(record.amount_due - record.amount_paid).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="5000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_date">Payment Date *</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => handleInputChange('payment_date', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method *</Label>
                  <Select value={formData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction_id">Transaction ID</Label>
                  <Input
                    id="transaction_id"
                    value={formData.transaction_id}
                    onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                    placeholder="TXN123456789"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about this payment..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-gradient">
                  Record Payment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by student name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="loading-spinner" />
        </div>
      ) : (
        <div className="grid gap-4">
          {payments.map((payment) => (
            <Card key={payment.id} className="hover-lift animate-fadeIn">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Receipt className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{getStudentName(payment.student_id)}</CardTitle>
                      <CardDescription>Payment ID: {payment.id.slice(-8)}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-2">
                      <IndianRupee className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(payment.amount).replace('₹', '')}
                      </span>
                    </div>
                    <Badge variant="outline" className={getPaymentMethodBadge(payment.payment_method)}>
                      {paymentMethods.find(m => m.value === payment.payment_method)?.label || payment.payment_method}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                  </div>
                  {payment.transaction_id && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <CreditCard className="w-4 h-4" />
                      <span className="truncate">{payment.transaction_id}</span>
                    </div>
                  )}
                </div>
                
                {payment.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">{payment.notes}</p>
                  </div>
                )}
                
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    Recorded: {new Date(payment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && payments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'No payments found for this search' 
                : 'Get started by recording your first payment'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsDialogOpen(true)} className="btn-gradient">
                <Plus className="w-4 h-4 mr-2" />
                Record First Payment
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Payments;