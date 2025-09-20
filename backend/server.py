from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
# MongoDB connection with certifi CA
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
import os

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

client = AsyncIOMotorClient(
    mongo_url,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=10000
)
db = client[db_name]



# Create the main app without a prefix
app = FastAPI(title="College Resource Planning System", version="1.0.0")

@app.on_event("startup")
async def startup_ping():
    try:
        await db.command("ping")
        print("✅ MongoDB ping OK")
    except Exception as e:
        print("❌ MongoDB ping failed:", e)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"

class FeeType(str, Enum):
    TUITION = "tuition"
    HOSTEL = "hostel"
    LAB = "lab"
    LIBRARY = "library"
    EXAM = "exam"
    MISCELLANEOUS = "miscellaneous"

class ExpenseCategory(str, Enum):
    INFRASTRUCTURE = "infrastructure"
    SALARIES = "salaries"
    UTILITIES = "utilities"
    MAINTENANCE = "maintenance"
    EQUIPMENT = "equipment"
    MISCELLANEOUS = "miscellaneous"

# Pydantic Models
class FeeStructure(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    fee_type: FeeType
    amount: float
    academic_year: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Student(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    name: str
    email: str
    course: str
    year: int
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StudentFeeRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    fee_structure_id: str
    amount_due: float
    amount_paid: float = 0.0
    payment_status: PaymentStatus = PaymentStatus.PENDING
    due_date: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Payment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    student_fee_record_id: str
    amount: float
    payment_date: datetime
    payment_method: str = "cash"
    transaction_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Expense(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: ExpenseCategory
    amount: float
    description: Optional[str] = None
    expense_date: datetime
    vendor: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Create models for API requests
class FeeStructureCreate(BaseModel):
    name: str
    fee_type: FeeType
    amount: float
    academic_year: str
    description: Optional[str] = None

class StudentCreate(BaseModel):
    student_id: str
    name: str
    email: str
    course: str
    year: int
    phone: Optional[str] = None

class StudentFeeRecordCreate(BaseModel):
    student_id: str
    fee_structure_id: str
    amount_due: float
    due_date: datetime

class PaymentCreate(BaseModel):
    student_id: str
    student_fee_record_id: str
    amount: float
    payment_date: datetime
    payment_method: str = "cash"
    transaction_id: Optional[str] = None
    notes: Optional[str] = None

class ExpenseCreate(BaseModel):
    title: str
    category: ExpenseCategory
    amount: float
    description: Optional[str] = None
    expense_date: datetime
    vendor: Optional[str] = None

# Helper function to prepare documents for MongoDB
def prepare_for_mongo(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
    return data

def parse_from_mongo(item):
    if isinstance(item, dict):
        for key, value in item.items():
            if isinstance(value, str) and key in ['created_at', 'updated_at', 'due_date', 'payment_date', 'expense_date']:
                try:
                    item[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except:
                    pass
    return item

# Fee Structure endpoints
@api_router.post("/fee-structures", response_model=FeeStructure)
async def create_fee_structure(fee_structure: FeeStructureCreate):
    fee_dict = fee_structure.dict()
    fee_obj = FeeStructure(**fee_dict)
    fee_doc = prepare_for_mongo(fee_obj.dict())
    await db.fee_structures.insert_one(fee_doc)
    return fee_obj

@api_router.get("/fee-structures", response_model=List[FeeStructure])
async def get_fee_structures():
    fee_structures = await db.fee_structures.find().to_list(1000)
    return [FeeStructure(**parse_from_mongo(fs)) for fs in fee_structures]

@api_router.get("/fee-structures/{fee_id}", response_model=FeeStructure)
async def get_fee_structure(fee_id: str):
    fee_structure = await db.fee_structures.find_one({"id": fee_id})
    if not fee_structure:
        raise HTTPException(status_code=404, detail="Fee structure not found")
    return FeeStructure(**parse_from_mongo(fee_structure))

# Student endpoints
@api_router.post("/students", response_model=Student)
async def create_student(student: StudentCreate):
    # Check if student_id already exists
    existing = await db.students.find_one({"student_id": student.student_id})
    if existing:
        raise HTTPException(status_code=400, detail="Student ID already exists")
    
    student_dict = student.dict()
    student_obj = Student(**student_dict)
    student_doc = prepare_for_mongo(student_obj.dict())
    await db.students.insert_one(student_doc)
    return student_obj

@api_router.get("/students", response_model=List[Student])
async def get_students(search: Optional[str] = Query(None), course: Optional[str] = Query(None)):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"student_id": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    if course:
        query["course"] = course
    
    students = await db.students.find(query).to_list(1000)
    return [Student(**parse_from_mongo(student)) for student in students]

@api_router.get("/students/{student_id}", response_model=Student)
async def get_student(student_id: str):
    student = await db.students.find_one({"id": student_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return Student(**parse_from_mongo(student))

# Student Fee Record endpoints
@api_router.post("/student-fee-records", response_model=StudentFeeRecord)
async def create_student_fee_record(record: StudentFeeRecordCreate):
    # Verify student and fee structure exist
    student = await db.students.find_one({"id": record.student_id})
    fee_structure = await db.fee_structures.find_one({"id": record.fee_structure_id})
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if not fee_structure:
        raise HTTPException(status_code=404, detail="Fee structure not found")
    
    record_dict = record.dict()
    record_obj = StudentFeeRecord(**record_dict)
    record_doc = prepare_for_mongo(record_obj.dict())
    await db.student_fee_records.insert_one(record_doc)
    return record_obj

@api_router.get("/student-fee-records", response_model=List[StudentFeeRecord])
async def get_student_fee_records(
    student_id: Optional[str] = Query(None),
    status: Optional[PaymentStatus] = Query(None)
):
    query = {}
    if student_id:
        query["student_id"] = student_id
    if status:
        query["payment_status"] = status
    
    records = await db.student_fee_records.find(query).to_list(1000)
    return [StudentFeeRecord(**parse_from_mongo(record)) for record in records]

# Payment endpoints
@api_router.post("/payments", response_model=Payment)
async def create_payment(payment: PaymentCreate):
    # Verify student fee record exists
    fee_record = await db.student_fee_records.find_one({"id": payment.student_fee_record_id})
    if not fee_record:
        raise HTTPException(status_code=404, detail="Student fee record not found")
    
    payment_dict = payment.dict()
    payment_obj = Payment(**payment_dict)
    payment_doc = prepare_for_mongo(payment_obj.dict())
    await db.payments.insert_one(payment_doc)
    
    # Update student fee record
    fee_record = StudentFeeRecord(**parse_from_mongo(fee_record))
    new_amount_paid = fee_record.amount_paid + payment.amount
    new_status = PaymentStatus.PAID if new_amount_paid >= fee_record.amount_due else PaymentStatus.PENDING
    
    await db.student_fee_records.update_one(
        {"id": payment.student_fee_record_id},
        {
            "$set": {
                "amount_paid": new_amount_paid,
                "payment_status": new_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return payment_obj

@api_router.get("/payments", response_model=List[Payment])
async def get_payments(student_id: Optional[str] = Query(None)):
    query = {}
    if student_id:
        query["student_id"] = student_id
    
    payments = await db.payments.find(query).to_list(1000)
    return [Payment(**parse_from_mongo(payment)) for payment in payments]

# Expense endpoints
@api_router.post("/expenses", response_model=Expense)
async def create_expense(expense: ExpenseCreate):
    expense_dict = expense.dict()
    expense_obj = Expense(**expense_dict)
    expense_doc = prepare_for_mongo(expense_obj.dict())
    await db.expenses.insert_one(expense_doc)
    return expense_obj

@api_router.get("/expenses", response_model=List[Expense])
async def get_expenses(category: Optional[ExpenseCategory] = Query(None)):
    query = {}
    if category:
        query["category"] = category
    
    expenses = await db.expenses.find(query).to_list(1000)
    return [Expense(**parse_from_mongo(expense)) for expense in expenses]

# Dashboard endpoints
@api_router.get("/dashboard/summary")
async def get_dashboard_summary():
    # Get total students
    total_students = await db.students.count_documents({})
    
    # Get total fees due and paid
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total_due": {"$sum": "$amount_due"},
                "total_paid": {"$sum": "$amount_paid"}
            }
        }
    ]
    fee_summary = await db.student_fee_records.aggregate(pipeline).to_list(1)
    
    total_due = fee_summary[0]["total_due"] if fee_summary else 0
    total_paid = fee_summary[0]["total_paid"] if fee_summary else 0
    pending_amount = total_due - total_paid
    
    # Get pending payments count
    pending_payments = await db.student_fee_records.count_documents({"payment_status": "pending"})
    
    # Get total expenses
    expense_pipeline = [
        {"$group": {"_id": None, "total_expenses": {"$sum": "$amount"}}}
    ]
    expense_summary = await db.expenses.aggregate(expense_pipeline).to_list(1)
    total_expenses = expense_summary[0]["total_expenses"] if expense_summary else 0
    
    return {
        "total_students": total_students,
        "total_fees_collected": total_paid,
        "pending_fees": pending_amount,
        "pending_payments_count": pending_payments,
        "total_expenses": total_expenses,
        "net_revenue": total_paid - total_expenses
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.get("/")
async def health_check():
    return {"status": "ok", "db": "connected"}
