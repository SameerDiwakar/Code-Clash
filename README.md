# 🚀 Code Clash

A competitive coding platform where programmers can challenge each other, solve coding problems, and improve their skills in a fun environment.

## 🌟 Features

### 🏆 Battle System
- **Coding Battles**: Challenge other programmers in coding competitions
- **Multiple Programming Languages**: Support for various programming languages
- **Code Execution**: Integrated with Judge0/Piston for reliable code execution
- **Leaderboard**: Compete with other programmers and climb the ranks
- **Gemini-Approved Problems**: Solve high-quality, verified coding challenges
- **Quick Battle Creation**: Special autofill feature to create battles in seconds

### 👤 User Profiles
- **Comprehensive Profiles**: Showcase your skills and experience
- **Progress Tracking**: Monitor your improvement over time
- **Profile Customization**: Personalize your profile with a picture and bio
- **Achievements**: Track your coding milestones and accomplishments

### 🏗️ Technical Stack

#### Frontend
- **React** with **TypeScript**
- **Vite** for fast development and builds
- **Shadcn UI** for beautiful, accessible components
- **React Query** for data fetching and state management
- **Monaco Editor** for code editing

#### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Judge0/Piston** for code execution
- **Cloudinary** for image storage

#### Additional Tools
- **Monaco Editor** for a powerful code editing experience
- **ESLint** and **Prettier** for code quality
- **Axios** for HTTP requests
- **Date-fns** for date manipulation
- **Radix UI** for accessible components

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- MongoDB instance
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/code-clash.git
   cd code-clash
   ```

2. **Set up the backend**
   ```bash
   cd Backend
   npm install
   cp .env.example .env
   # Update .env with your configuration
   npm start
   ```

3. **Set up the frontend**
   ```bash
   cd ../Frontend
   npm install
   cp .env.example .env
   # Update .env with your configuration
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:4000

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
