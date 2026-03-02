# LogiTechSolutions - CSV Data Processor

A simple Node.js backend application for processing CSV files and storing data in a MySQL database.

## Features

- CSV file upload via API
- Process and import customer, product, supplier, and transaction data
- RESTful API endpoint for CSV processing
- MySQL database integration

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Dependencies:**
  - express
  - mysql2
  - multer
  - csv-parser
  - dotenv
  - nodemon

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env` file:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=LogiTechSolutions
```

3. Start the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## API Endpoints

### POST /api/procesar-csv

Process and import CSV data into the database.

## Database Tables

- customers
- products
- category
- suppliers
- transactions
- transaction_details

## Project Structure

```
├── backend/
│   ├── db.js          # Database connection
│   ├── server.js      # Express server and routes
│   └── uploads/       # CSV file uploads
├── package.json
└── README.md
```
