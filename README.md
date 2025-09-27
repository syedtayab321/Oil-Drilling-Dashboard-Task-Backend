# Drill AI Intelligence Platform - Backend

This is the backend component of the Drill AI Intelligence Platform, a RESTful API built with Node.js, Express, and MongoDB to support oil drilling data analysis. It handles file uploads (XLSX parsing), data persistence, and chatbot responses via the OpenAI API.

## Author
- Syed Tayab (syedtayab321)

## Overview
- **Tech Stack**: Node.js, Express, Mongoose, Multer, XLSX, OpenAI, Winston (logging), CORS.
- **Features**:
  - `/upload`: Accepts XLSX files, parses them, and saves data to MongoDB.
  - `/chat`: Processes user queries with OpenAI, using uploaded data as context.
  - File persistence with cleanup.
  - Logging for debugging and monitoring.
- **Deployment**: Hosted on AWS EC2 with PM2 for process management.

## Prerequisites
- Node.js (v18 or later)
- npm (v9 or later)
- Git
- MongoDB (local or Atlas)
- AWS EC2 instance (optional for deployment)
- OpenAI API key

## Installation
1. Clone the repository: