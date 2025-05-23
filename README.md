# QuizApp

A full-stack quiz application built with **Next.js (App Router)** for the frontend and **FastAPI** for the backend. It supports user signup, login, quiz management, and quiz attempts.

---

## Features

* **User authentication**: Signup and login
* **Quiz management**: Listing, creation, editing, and deletion (admin)
* **Quiz attempts**: Users can attempt quizzes and get results
* **Leaderboard**: View leaderboard per quiz
* **Responsive UI**: Styled with **Tailwind CSS**
* **Environment-based API URL configuration**
* **Next.js App Router** for routing and components

---

## Tech Stack

* **Frontend**: Next.js 13+ (App Router), React, Tailwind CSS
* **Backend**: FastAPI (Python)
* **API communication** with JWT authentication
* **Environment variables** management via `.env.local`

---

## Getting Started

### Prerequisites

* Node.js (v16+ recommended)
* Python 3.8+
* `pip` for backend dependencies

### Frontend Setup

1.  **Clone the repo**:

    ```bash
    git clone https://github.com/yourusername/quizapp.git
    cd quizapp/frontend
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Create a `.env.local` file** at the root (inside /frontend) and add your backend API URL:

    ```ini
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

4.  **Run the development server**:

    ```bash
    npm run dev
    ```

    Open `http://localhost:3000` in your browser.

### Backend Setup

1.  **Navigate to the backend folder** (if separate):

    ```bash
    cd backend
    ```

2.  **Create and activate a Python virtual environment**:

    ```bash
    python -m venv venv
    source venv/bin/activate # Windows: venv\Scripts\activate
    ```

3.  **Install dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

4. **Setup Postgres**:
    Create tables with the following schema:
    ```
    -- Table for users
    CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
    );

    ---
    
    -- Table for quizzes
    CREATE TABLE quizzes (
        id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        description VARCHAR,
        time_limit INTEGER,
        creator_id INTEGER,
        FOREIGN KEY (creator_id) REFERENCES users(id)
    );
    
    ---
    
    -- Table for questions
    CREATE TABLE questions (
        id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL,
    text VARCHAR NOT NULL,
    option_a VARCHAR NOT NULL,
    option_b VARCHAR NOT NULL,
    option_c VARCHAR,
    option_d VARCHAR,
    correct_option VARCHAR NOT NULL, -- 'a', 'b', 'c', 'd'
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );
    
    ---
    
    -- Table for attempts
    CREATE TABLE attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        quiz_id INTEGER NOT NULL,
        score INTEGER,
        total INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
    );
    
    ---
    
    -- Table for answers given during an attempt
    CREATE TABLE answers (
        id SERIAL PRIMARY KEY,
        attempt_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
    selected_option VARCHAR,
    FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );
    ```
   
5. **Create an .env file**:

   Inside /backend, run:
   ```
   cd app && cat >.env
   DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
    ALLOWED_ORIGINS=http://localhost:3000
   ```
6.  **Run the FastAPI server**:

    ```bash
    uvicorn app.main:app --reload
    ```

---

## API Endpoints

| Method | Endpoint                    | Description               |
| :----- | :-------------------------- | :------------------------ |
| `POST`   | `/users/signup`             | Signup                    |
| `POST`   | `/users/login`              | Login                     |
| `GET`    | `/quizzes/`                 | View all quizzes          |
| `POST`   | `/quizzes/`                 | Admin creates a quiz      |
| `GET`    | `/quizzes/{quiz_id}/questions` | Get quiz questions        |
| `POST`   | `/quizzes/{quiz_id}/attempt`| Attempt quiz              |
| `PUT`    | `/quizzes/{quiz_id}`        | Admin updates quiz        |
| `DELETE` | `/quizzes/{quiz_id}`        | Delete quiz               |
| `GET`    | `/quizzes/leaderboard/{quiz_id}` | Get leaderboard per quiz |

## Live Deployments
ngrok: https://sunbird-flying-presently.ngrok-free.app/
use admin@pearto.com, password:pspsps for admin access
