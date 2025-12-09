<p align="center">
  <img src="src/assets/logo.png" alt="LetterLift Logo" width="120" height="120">
</p>

<h1 align="center">LetterLift</h1>

<p align="center">
  <strong>Your AI-Powered Letter Writing Assistant</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS">
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/sanggitsaaran/Letter_AI?style=flat-square" alt="License">
  <img src="https://img.shields.io/github/stars/sanggitsaaran/Letter_AI?style=flat-square" alt="Stars">
  <img src="https://img.shields.io/github/forks/sanggitsaaran/Letter_AI?style=flat-square" alt="Forks">
  <img src="https://img.shields.io/github/issues/sanggitsaaran/Letter_AI?style=flat-square" alt="Issues">
</p>

---

## 📋 Overview

**LetterLift** is an intelligent, real-time writing assistant designed to elevate your letter writing experience. Moving beyond simple text editors, LetterLift leverages a locally-hosted AI model (TinyLlama) to provide **instant feedback**, **predictive text suggestions**, and **multi-document management** — all within a sleek, modern interface.

Whether you're drafting professional correspondence, personal letters, or formal applications, LetterLift ensures your writing is polished, clear, and impactful.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **Real-time AI Feedback** | Get instant analysis on tone, clarity, and grammar as you type |
| ⚡ **Predictive Autocompletion** | Context-aware text suggestions — press `Tab` to accept |
| 📁 **Multi-Document Management** | Create, load, and delete multiple letters with ease |
| 💾 **Persistent State** | Auto-save functionality; pick up right where you left off |
| 🌗 **Dark/Light Mode** | Toggle between themes for comfortable writing |
| 🔄 **Real-time Sync** | Socket.IO powered live updates and saving |
| 📱 **Responsive Design** | Beautiful UI that works on all screen sizes |

---

## 🎯 Demo

<!-- Add a GIF or screenshot of your application here -->
<!-- ![LetterLift Demo](./demo.gif) -->

> **Live Demo:** Coming Soon

---

## 🛠️ Tech Stack

### Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  Node.js API    │────▶│  Python AI      │
│  (Port 5173)    │     │  (Port 5000)    │     │  (Port 8000)    │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │  MongoDB Atlas  │
                        │                 │
                        └─────────────────┘
```

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI library with hooks |
| **TypeScript** | Type-safe development |
| **Vite** | Lightning-fast build tool |
| **TailwindCSS** | Utility-first styling |
| **Socket.IO Client** | Real-time communication |
| **HeadlessUI** | Accessible UI components |
| **Heroicons** | Beautiful hand-crafted icons |

### Backend (Node.js)
| Technology | Purpose |
|------------|---------|
| **Express.js** | REST API framework |
| **Mongoose** | MongoDB ODM |
| **Socket.IO** | WebSocket server |
| **Axios** | HTTP client for AI service |
| **dotenv** | Environment configuration |
| **CORS** | Cross-origin resource sharing |

### AI Service (Python)
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance API framework |
| **Hugging Face Transformers** | Model loading & inference |
| **TinyLlama 1.1B** | Lightweight LLM for text analysis |
| **PyTorch** | Deep learning framework |
| **bitsandbytes** | 4-bit quantization for efficiency |

### Database
| Technology | Purpose |
|------------|---------|
| **MongoDB Atlas** | Cloud-hosted NoSQL database |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| **Git** | Any | `git --version` |
| **Node.js** | ≥ 16.x | `node --version` |
| **npm** | ≥ 8.x | `npm --version` |
| **Python** | ≥ 3.10 | `python --version` |
| **pip** | Any | `pip --version` |

You'll also need:
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier available)
- ~4GB RAM for the AI model (8GB recommended)
- GPU optional but recommended for faster inference

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/sanggitsaaran/Letter_AI.git
cd Letter_AI
```

#### 2️⃣ Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

**A. Configure Environment Variables**

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your MongoDB connection string
# MONGO_URI=your_mongodb_connection_string
```

**B. Install Node.js Dependencies**

```bash
npm install
```

**C. Setup Python AI Service**

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

#### 3️⃣ Frontend Setup

Navigate back to the root directory and install dependencies:

```bash
cd ..
npm install
```

### Running the Application

You need **three terminals** to run the complete application:

<table>
<tr>
<th>Terminal</th>
<th>Service</th>
<th>Command</th>
<th>Expected Output</th>
</tr>
<tr>
<td>1️⃣</td>
<td>Python AI Service</td>
<td>

```bash
cd backend
.\venv\Scripts\activate  # Windows
python ai_api.py
```

</td>
<td>

```
✅ Model loaded successfully!
```

</td>
</tr>
<tr>
<td>2️⃣</td>
<td>Node.js Backend</td>
<td>

```bash
cd backend
node server.js
```

</td>
<td>

```
Connected to MongoDB 🚀
Server running on port 5000
```

</td>
</tr>
<tr>
<td>3️⃣</td>
<td>React Frontend</td>
<td>

```bash
npm run dev
```

</td>
<td>

```
VITE ready at localhost:5173
```

</td>
</tr>
</table>

**🎉 Open your browser and navigate to:** [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
Letter_AI/
├── 📂 backend/
│   ├── ai_api.py           # FastAPI AI service
│   ├── server.js           # Express.js API server
│   ├── package.json        # Node.js dependencies
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment template
│
├── 📂 src/
│   ├── App.tsx             # Main React component
│   ├── main.tsx            # Application entry point
│   ├── index.css           # Global styles
│   └── 📂 assets/          # Images and icons
│
├── 📂 public/              # Static assets
│
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── package.json            # Frontend dependencies
├── LICENSE                 # MIT License
└── README.md               # This file
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB Atlas connection string | ✅ Yes |

### Ports

| Service | Default Port | Configurable |
|---------|-------------|--------------|
| Frontend (Vite) | 5173 | `vite.config.js` |
| Backend (Node.js) | 5000 | `server.js` |
| AI Service (Python) | 8000 | `ai_api.py` |

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated**.

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Update documentation for any changes
- Test your changes thoroughly

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - Copyright (c) 2025 Sanggit Saaran K C S
```

---

## 👨‍💻 Author

<p align="center">
  <img src="https://github.com/sanggitsaaran.png" width="100" height="100" style="border-radius: 50%;">
</p>

<h3 align="center">Sanggit Saaran K C S</h3>

<p align="center">
  <a href="https://www.linkedin.com/in/sanggit-saaran-k-c-s/">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
  <a href="https://github.com/sanggitsaaran">
    <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
</p>

---

## 🙏 Acknowledgments

- [TinyLlama](https://github.com/jzhang38/TinyLlama) for the lightweight language model
- [Hugging Face](https://huggingface.co/) for the transformers library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the blazing-fast build tool

---

<p align="center">
  <strong>⭐ Star this repository if you found it helpful!</strong>
</p>

<p align="center">
  Made with ❤️ by <a href="https://github.com/sanggitsaaran">Sanggit Saaran</a>
</p>
