import requests
import sys
from datetime import datetime, timezone
import json

class CRPSystemTester:
    def __init__(self, base_url="https://college-crp.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_data = {
            'students': [],
            'fee_structures': [],
            'student_fee_records': [],
            'payments': [],
            'expenses': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    return success, response_data
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_dashboard_summary(self):
        """Test dashboard summary endpoint"""
        success, response = self.run_test(
            "Dashboard Summary",
            "GET",
            "dashboard/summary",
            200
        )
        if success:
            print(f"   Dashboard data: {response}")
        return success

    def test_create_students(self):
        """Create test students"""
        students_data = [
            {
                "student_id": "CS2024001",
                "name": "John Doe",
                "email": "john.doe@college.edu",
                "course": "Computer Science",
                "year": 2,
                "phone": "9876543210"
            },
            {
                "student_id": "ME2024002", 
                "name": "Jane Smith",
                "email": "jane.smith@college.edu",
                "course": "Mechanical Engineering",
                "year": 1,
                "phone": "9876543211"
            },
            {
                "student_id": "EC2024003",
                "name": "Bob Johnson",
                "email": "bob.johnson@college.edu", 
                "course": "Electronics",
                "year": 3,
                "phone": "9876543212"
            }
        ]

        for student_data in students_data:
            success, response = self.run_test(
                f"Create Student {student_data['student_id']}",
                "POST",
                "students",
                200,
                data=student_data
            )
            if success:
                self.created_data['students'].append(response)

        return len(self.created_data['students']) > 0

    def test_get_students(self):
        """Test getting students with search and filter"""
        # Get all students
        success, response = self.run_test(
            "Get All Students",
            "GET", 
            "students",
            200
        )
        
        if success:
            print(f"   Found {len(response)} students")

        # Test search functionality
        success, response = self.run_test(
            "Search Students by Name",
            "GET",
            "students",
            200,
            params={"search": "John"}
        )

        # Test filter by course
        success, response = self.run_test(
            "Filter Students by Course",
            "GET",
            "students", 
            200,
            params={"course": "Computer Science"}
        )

        return success

    def test_create_fee_structures(self):
        """Create test fee structures"""
        fee_structures_data = [
            {
                "name": "Tuition Fee 2024",
                "fee_type": "tuition",
                "amount": 50000.0,
                "academic_year": "2024-25",
                "description": "Annual tuition fee for academic year 2024-25"
            },
            {
                "name": "Hostel Fee 2024",
                "fee_type": "hostel", 
                "amount": 25000.0,
                "academic_year": "2024-25",
                "description": "Annual hostel accommodation fee"
            },
            {
                "name": "Lab Fee 2024",
                "fee_type": "lab",
                "amount": 15000.0,
                "academic_year": "2024-25",
                "description": "Laboratory usage and equipment fee"
            }
        ]

        for fee_data in fee_structures_data:
            success, response = self.run_test(
                f"Create Fee Structure {fee_data['name']}",
                "POST",
                "fee-structures",
                200,
                data=fee_data
            )
            if success:
                self.created_data['fee_structures'].append(response)

        return len(self.created_data['fee_structures']) > 0

    def test_get_fee_structures(self):
        """Test getting fee structures"""
        success, response = self.run_test(
            "Get All Fee Structures",
            "GET",
            "fee-structures", 
            200
        )
        
        if success:
            print(f"   Found {len(response)} fee structures")

        return success

    def test_create_student_fee_records(self):
        """Create student fee records"""
        if not self.created_data['students'] or not self.created_data['fee_structures']:
            print("❌ Cannot create fee records - missing students or fee structures")
            return False

        # Create fee records for each student
        for student in self.created_data['students']:
            for fee_structure in self.created_data['fee_structures']:
                record_data = {
                    "student_id": student['id'],
                    "fee_structure_id": fee_structure['id'],
                    "amount_due": fee_structure['amount'],
                    "due_date": "2024-12-31T23:59:59Z"
                }
                
                success, response = self.run_test(
                    f"Create Fee Record for {student['name']} - {fee_structure['name']}",
                    "POST",
                    "student-fee-records",
                    200,
                    data=record_data
                )
                if success:
                    self.created_data['student_fee_records'].append(response)

        return len(self.created_data['student_fee_records']) > 0

    def test_get_student_fee_records(self):
        """Test getting student fee records"""
        success, response = self.run_test(
            "Get All Student Fee Records",
            "GET",
            "student-fee-records",
            200
        )
        
        if success:
            print(f"   Found {len(response)} fee records")

        return success

    def test_create_payments(self):
        """Create test payments"""
        if not self.created_data['student_fee_records']:
            print("❌ Cannot create payments - missing fee records")
            return False

        # Create partial payments for some fee records
        for i, fee_record in enumerate(self.created_data['student_fee_records'][:3]):
            payment_data = {
                "student_id": fee_record['student_id'],
                "student_fee_record_id": fee_record['id'],
                "amount": fee_record['amount_due'] * 0.5,  # Pay 50%
                "payment_date": datetime.now(timezone.utc).isoformat(),
                "payment_method": "online",
                "transaction_id": f"TXN{1000 + i}",
                "notes": "Partial payment via online banking"
            }
            
            success, response = self.run_test(
                f"Create Payment for Fee Record {i+1}",
                "POST",
                "payments",
                200,
                data=payment_data
            )
            if success:
                self.created_data['payments'].append(response)

        return len(self.created_data['payments']) > 0

    def test_get_payments(self):
        """Test getting payments"""
        success, response = self.run_test(
            "Get All Payments",
            "GET",
            "payments",
            200
        )
        
        if success:
            print(f"   Found {len(response)} payments")

        return success

    def test_create_expenses(self):
        """Create test expenses"""
        expenses_data = [
            {
                "title": "Server Maintenance",
                "category": "infrastructure",
                "amount": 15000.0,
                "description": "Monthly server and network maintenance",
                "expense_date": datetime.now(timezone.utc).isoformat(),
                "vendor": "TechCorp Solutions"
            },
            {
                "title": "Faculty Salaries",
                "category": "salaries", 
                "amount": 500000.0,
                "description": "Monthly faculty salary payments",
                "expense_date": datetime.now(timezone.utc).isoformat(),
                "vendor": "HR Department"
            },
            {
                "title": "Electricity Bill",
                "category": "utilities",
                "amount": 25000.0,
                "description": "Monthly electricity charges",
                "expense_date": datetime.now(timezone.utc).isoformat(),
                "vendor": "State Electricity Board"
            }
        ]

        for expense_data in expenses_data:
            success, response = self.run_test(
                f"Create Expense {expense_data['title']}",
                "POST",
                "expenses",
                200,
                data=expense_data
            )
            if success:
                self.created_data['expenses'].append(response)

        return len(self.created_data['expenses']) > 0

    def test_get_expenses(self):
        """Test getting expenses with filtering"""
        success, response = self.run_test(
            "Get All Expenses",
            "GET",
            "expenses",
            200
        )
        
        if success:
            print(f"   Found {len(response)} expenses")

        # Test filter by category
        success, response = self.run_test(
            "Filter Expenses by Category",
            "GET",
            "expenses",
            200,
            params={"category": "infrastructure"}
        )

        return success

    def test_dashboard_after_data(self):
        """Test dashboard summary after creating data"""
        success, response = self.run_test(
            "Dashboard Summary After Data Creation",
            "GET",
            "dashboard/summary",
            200
        )
        if success:
            print(f"   Updated Dashboard data: {response}")
            # Verify calculations
            if response.get('total_students', 0) > 0:
                print("   ✅ Students count updated")
            if response.get('total_fees_collected', 0) > 0:
                print("   ✅ Fees collected updated")
            if response.get('total_expenses', 0) > 0:
                print("   ✅ Expenses updated")
        return success

def main():
    print("🚀 Starting College Resource Planning System API Tests")
    print("=" * 60)
    
    tester = CRPSystemTester()
    
    # Test sequence
    test_results = []
    
    # 1. Test initial dashboard
    test_results.append(tester.test_dashboard_summary())
    
    # 2. Test students module
    test_results.append(tester.test_create_students())
    test_results.append(tester.test_get_students())
    
    # 3. Test fee structures module
    test_results.append(tester.test_create_fee_structures())
    test_results.append(tester.test_get_fee_structures())
    
    # 4. Test student fee records (backend logic)
    test_results.append(tester.test_create_student_fee_records())
    test_results.append(tester.test_get_student_fee_records())
    
    # 5. Test payments module
    test_results.append(tester.test_create_payments())
    test_results.append(tester.test_get_payments())
    
    # 6. Test expenses module
    test_results.append(tester.test_create_expenses())
    test_results.append(tester.test_get_expenses())
    
    # 7. Test dashboard after data creation
    test_results.append(tester.test_dashboard_after_data())
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    print("=" * 60)
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend API tests passed!")
        return 0
    else:
        failed_tests = tester.tests_run - tester.tests_passed
        print(f"❌ {failed_tests} tests failed. Check the logs above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())