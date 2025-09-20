import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/Card";
import {
  Label,
  Input,
  Textarea,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
} from "./ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/Dialog";
import { Search, Receipt, Calendar, CreditCard, IndianRupee, Plus } from "lucide-react";
import api from "../api"; // adjust path if needed
import { formatCurrency } from "../utils"; // adjust path if needed

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [formData, setFormData] = useState({
    student_id: "",
    fee_structure_id: "",
    amount: "",
    payment_date: "",
    payment_method: "",
    transaction_id: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "upi", label: "UPI" },
    { value: "bank_transfer", label: "Bank Transfer" },
  ];

  // Fetch students
  const fetchStudents = async () => {
    const res = await api.get("/students");
    setStudents(res.data);
  };

  // Fetch fee structures
  const fetchFeeStructures = async () => {
    const res = await api.get("/fee-structures");
    setFeeStructures(res.data);
  };

  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/payments");
      setPayments(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchFeeStructures();
    fetchPayments();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/payments", formData);
    setIsDialogOpen(false);
    fetchPayments();
  };

  const getStudentName = (id) => {
    const student = students.find((s) => s.id === id);
    return student ? `${student.name} (${student.student_id})` : "Unknown";
  };

  const getFeeStructureName = (id) => {
    if (!id) return "General";
    const fs = feeStructures.find((f) => f.id === id);
    return fs ? fs.name : "Unknown Fee";
  };

  const getPaymentMethodBadge = (method) => {
    switch (method) {
      case "cash":
        return "bg-green-100 text-green-800";
      case "card":
        return "bg-blue-100 text-blue-800";
      case "upi":
        return "bg-purple-100 text-purple-800";
      case "bank_transfer":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Payment Dialog */}
      <div className="flex justify-end">
        <Button onClick={() => setIsDialogOpen(true)} className="btn-gradient">
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student */}
              <div className="space-y-2">
                <Label htmlFor="student_id">Student *</Label>
                <Select
                  value={formData.student_id}
                  onValueChange={(value) => handleInputChange("student_id", value)}
                >
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

              {/* Fee Structure (optional) */}
              <div className="space-y-2">
                <Label htmlFor="fee_structure_id">Fee Type</Label>
                <Select
                  value={formData.fee_structure_id}
                  onValueChange={(value) => handleInputChange("fee_structure_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee type" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeStructures.map((fs) => (
                      <SelectItem key={fs.id} value={fs.id}>
                        {fs.name} — ₹{fs.amount.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount + Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
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
                    onChange={(e) => handleInputChange("payment_date", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Method + Transaction ID */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method *</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => handleInputChange("payment_method", value)}
                  >
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
                    onChange={(e) => handleInputChange("transaction_id", e.target.value)}
                    placeholder="TXN123456789"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Additional notes about this payment..."
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
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