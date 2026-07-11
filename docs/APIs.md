# Blueprint Advisor API Documentation

All API requests should target base URL: `http://localhost:5000/api`

---

## 1. Authentication (OTP & JWT)

### Send OTP
Generates a verification code and sends it via SMS.
- **Method**: `POST`
- **Path**: `/auth/send-otp`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  { "phone": "9876543210" }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "OTP sent successfully.",
    "note": "Use test code: 123456"
  }
  ```

### Verify OTP
Authenticates user by validating OTP code. Sets a secure HTTPOnly refresh cookie and returns JWT access token.
- **Method**: `POST`
- **Path**: `/auth/verify-otp`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "phone": "9876543210",
    "otp": "123456"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "accessToken": "ey...",
    "user": {
      "id": "usr-123",
      "phone": "9876543210",
      "name": "Akash",
      "role": "USER"
    }
  }
  ```

### Current User Profile
Retrieves user profile parameters for current session.
- **Method**: `GET`
- **Path**: `/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "id": "usr-123",
    "phone": "9876543210",
    "name": "Akash",
    "email": "akash.fintech@advisor.in",
    "pan": "ABCDE1234F",
    "gst": "27AAAAA1111A1Z1",
    "role": "USER"
  }
  ```

---

## 2. Service Requests

### Create Request
- **Method**: `POST`
- **Path**: `/requests`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "serviceType": "ITR",
    "serviceName": "File ITR FY 2025-26",
    "description": "Filing my standard tax returns.",
    "priority": "THIS_WEEK"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "request": {
      "id": "req-456",
      "userId": "usr-123",
      "serviceType": "ITR",
      "serviceName": "File ITR FY 2025-26",
      "status": "SUBMITTED",
      "progressPercent": 15
    }
  }
  ```

### List Requests
Returns active requests. (Clients get their own; Experts get assigned cases; Admins get all).
- **Method**: `GET`
- **Path**: `/requests`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "requests": [
      {
        "id": "req-456",
        "serviceName": "File ITR FY 2025-26",
        "status": "SUBMITTED",
        "progressPercent": 15
      }
    ]
  }
  ```

### Update Request
Modifies parameters (Urgency, status timeline milestones, progress percent, assigned CA).
- **Method**: `PATCH`
- **Path**: `/requests/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "status": "IN_PROGRESS",
    "progressPercent": 60
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "request": {
      "id": "req-456",
      "status": "IN_PROGRESS",
      "progressPercent": 60
    }
  }
  ```

---

## 3. Booking & Slots

### Available Slots
Check available booking slots for a CA on a date.
- **Method**: `GET`
- **Path**: `/slots?expertId=<expert-id>&date=Jun+18,+2026`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "slots": [
      { "slot": "11:00 AM", "available": true },
      { "slot": "12:00 PM", "available": false },
      { "slot": "03:00 PM", "available": true },
      { "slot": "06:00 PM", "available": true }
    ]
  }
  ```

### Book Appointment
Create a consultation session.
- **Method**: `POST`
- **Path**: `/bookings`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "requestId": "req-456",
    "expertId": "exp-789",
    "date": "Jun 18, 2026",
    "slot": "11:00 AM",
    "type": "VIDEO"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "booking": {
      "id": "bk-999",
      "status": "PENDING"
    }
  }
  ```

---

## 4. Payments (Razorpay)

### Initialize Order
Generate a Razorpay Order ID.
- **Method**: `POST`
- **Path**: `/payments/create-order`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "amount": 1500,
    "requestId": "req-456"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "orderId": "order_OPt89a7Acd1",
    "amount": 159900,
    "currency": "INR"
  }
  ```

### Verify Signature
Verifies signature and updates request status state to EXPERT_ASSIGNED.
- **Method**: `POST`
- **Path**: `/payments/verify`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "orderId": "order_OPt89a7Acd1",
    "paymentId": "pay_OPt98Hkd928A",
    "signature": "sig_hash_key_123456",
    "method": "Google Pay",
    "requestId": "req-456"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Transaction successfully processed and verified.",
    "transactionId": "pay_OPt98Hkd928A"
  }
  ```

---

## 5. Document Management

### Get Signed Upload Link
Get presigned PUT url for document category.
- **Method**: `POST`
- **Path**: `/documents/upload`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "PAN_Copy.pdf",
    "category": "PAN",
    "fileType": "application/pdf",
    "size": "1.2 MB",
    "requestId": "req-456"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "documentId": "doc-991",
    "uploadUrl": "http://localhost:5000/mock-upload/docs/pan.pdf",
    "key": "docs/pan.pdf"
  }
  ```
