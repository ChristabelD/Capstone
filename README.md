# theVendor

## Overview
**theVendor** is a comprehensive pharmaceutical delivery platform that includes a backend API and a client-side application for pharmacies and customers. The system facilitates the seamless ordering, tracking, and delivery of medications.

## Project Structure
- **pharmaceutical-delivery-api** - The backend API that handles authentication, order management, inventory tracking, and delivery coordination.
- **pharmacy-client** - The frontend application for pharmacies and customers to place and track orders.

---

## Features
### **Pharmaceutical Delivery API**
- User authentication & authorization
- Order management system
- Inventory tracking
- Secure payment integration
- Delivery scheduling & tracking
- Notifications & alerts

### **Pharmacy Client**
- User-friendly interface for pharmacies and customers
- Search and order medications
- Real-time order tracking
- Payment processing
- Order history and management

---

## Tech Stack
### **Backend (pharmaceutical-delivery-api)**
- Django REST Framework (DRF)
- PostgreSQL
- Celery & Redis (Task Queue)
- JWT Authentication

### **Frontend (pharmacy-client)**
- React.js
- Tailwind CSS
- Redux Toolkit
- Axios

---

## Setup & Installation
### **Backend**
1. Clone the repository:
   ```sh
   git clone https://github.com/christabelD/pharmaceutical-delivery-api.git
   cd pharmaceutical-delivery-api
   ```
2. Create a virtual environment and install dependencies:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Configure environment variables and run migrations:
   ```sh
   python manage.py migrate
   ```
4. Start the server:
   ```sh
   python manage.py runserver
   ```

### **Frontend**
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/pharmacy-client.git
   cd pharmacy-client
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm start
   ```

---

## API Documentation
API documentation can be accessed via Swagger:
```sh
http://localhost:8000/api/docs/
```

---

## Contribution
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m "Added feature-name"`
4. Push to branch: `git push origin feature-name`
5. Create a pull request

---

## License
This project is licensed under the MIT License. See the LICENSE file for details.

---

