# theVendor

## Overview

theVendor is a pharmaceutical delivery platform that includes two main components:

1. **pharmaceutical-delivery-api** – A backend API that manages pharmaceutical orders, deliveries, and user authentication.
2. **pharmacy-client** – A frontend client for pharmacies and users to place and track orders.

## Features
- Secure authentication and authorization
- Order placement and tracking
- Pharmacy inventory management
- Delivery status updates

## Installation & Setup

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (for frontend and backend)
- [Python](https://www.python.org/) and [Django](https://www.djangoproject.com/) (for API)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)
- [PostgreSQL](https://www.postgresql.org/) (or another supported database)

### Backend (pharmaceutical-delivery-api)

1. Clone the repository:
   ```bash
   git clone https://github.com/ChristabelD/pharmaceutical-delivery-api.git
   cd pharmaceutical-delivery-api
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables (`.env` file):
   ```
   DATABASE_URL=your_database_url
   SECRET_KEY=your_secret_key
   ```
5. Run migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the server:
   ```bash
   python manage.py runserver
   ```

### Frontend (pharmacy-client)

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/pharmacy-client.git
   cd pharmacy-client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and configure API endpoints:
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Running with Docker

1. Ensure Docker is installed.
2. Navigate to the project directory.
3. Build and run using Docker Compose:
   ```bash
   docker-compose up --build
   ```

## Related Files
- `pharmaceutical-delivery-api/` – Backend source code
- `pharmacy-client/` – Frontend source code
- `docker-compose.yml` – Configuration for containerized deployment
- `.env.example` – Example environment variable file
- `requirements.txt` – Backend dependencies
- `package.json` – Frontend dependencies

## Contributing
Contributions are welcome! Please submit a pull request or open an issue.

## License
This project is licensed under the MIT License.
