# Letter AI ✍️

Letter AI is an intelligent, real-time writing assistant designed to improve your writing by providing **instant feedback and predictive text suggestions**. This project moves beyond simple text editors by leveraging a local AI model to offer a proactive and dynamic writing experience. It's built with a modern, full-stack architecture featuring React, Node.js, and a Python-based AI service.



## ✨ Key Features

-   **Real-time AI Feedback:** Get instant analysis on your writing's tone, clarity, and grammar as you type.
-   **Predictive Text Autocompletion:** Smart, context-aware suggestions appear as you write. Press `Tab` to accept and speed up your workflow.
-   **Multi-Document Management:** Create, load, and delete multiple letters, with your work saved automatically.
-   **Persistent State:** The application remembers your last active letter, so you can pick up right where you left off.
-   **Modern & Responsive UI:** A clean, intuitive interface built with React and TailwindCSS.

## 🛠️ Tech Stack

The application uses a modern microservice-style architecture to separate concerns and ensure scalability.

-   **Frontend:**
    -   **React** & **TypeScript**
    -   **Vite** for a blazing-fast development experience
    -   **TailwindCSS** for utility-first styling
    -   **Socket.IO Client** for real-time communication

-   **Backend (Node.js):**
    -   **Express.js** for the API server
    -   **Mongoose** for MongoDB object modeling
    -   **Socket.IO** for real-time saving
    -   **Axios** for inter-service communication
    -   **Dotenv** for environment variable management

-   **AI Service (Python):**
    -   **FastAPI** for a high-performance AI inference server
    -   **Hugging Face `transformers`** for model interaction
    -   **PyTorch** as the deep learning framework
    -   **`bitsandbytes`** for 4-bit model quantization (memory efficiency)

-   **Database:**
    -   **MongoDB Atlas**

## 🚀 Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

-   **Git**
-   **Node.js** (v16 or later) and **npm**
-   **Python** (v3.10 or later) and **pip**
-   A **MongoDB Atlas** account and a connection string.

### 1. Clone the Repository

```bash
git clone https://github.com/sanggitsaaran/Letter_AI.git
cd Letter_AI
```

### 2. Backend Setup

First, set up the Node.js server and the Python AI service, which are both in the `backend` directory.

```bash
cd backend
```

**A. Node.js Server:**

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Create an environment file:** Create a new file named `.env` in the `backend` directory. This will store your secret database connection string.

    ```
    # backend/.env
    MONGO_URI=your_mongodb_connection_string_goes_here
    ```

**B. Python AI Service:**

1.  **Create a Python virtual environment.** This is highly recommended to keep dependencies isolated.
    ```bash
    # On macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

    # On Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

2.  **Create a `requirements.txt` file** in the `backend` directory with the following content:
    ```
    # backend/requirements.txt
    fastapi
    uvicorn[standard]
    pydantic
    python-multipart
    torch
    transformers
    accelerate
    bitsandbytes
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

### 3. Frontend Setup

Now, set up the React frontend.

1.  **Navigate to the root directory:**
    ```bash
    cd .. 
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### 4. Running the Application

You will need to have **three separate terminals** open to run the entire application.

**➡️ Terminal 1: Start the Python AI Service**
*(Make sure your virtual environment is activated)*
```bash
cd backend
python ai_api.py
```
Wait until you see the message "Model loaded successfully!"

**➡️ Terminal 2: Start the Node.js Backend Server**
```bash
cd backend
node server.js
```
Wait until you see "Connected to MongoDB 🚀" and "Server running on port 5000".

**➡️ Terminal 3: Start the React Frontend**
*(From the root `Letter_AI` directory)*
```bash
npm run dev
```

Your application is now running! Open your browser and go to **[http://localhost:5173](http://localhost:5173)**.

## 👨‍💻 Author

**Sanggit Saaran K C S**

-   🔗 [LinkedIn](https://www.linkedin.com/in/sanggit-saaran-k-c-s/)
-   💻 [GitHub](https://github.com/sanggitsaaran)