# 🏥 Hospital Management System (MedCore HMS)

A comprehensive hospital management system built with React, TypeScript, and Tailwind CSS.

## 🌐 Live Application

**Access the live application here:** [https://donald28-gum.github.io/hospital-management-system/](https://donald28-gum.github.io/hospital-management-system/)

## 📋 Features

- **👤 Admin Authentication**: Secure login system for authorized personnel
- **👥 Patient Management**: Add, view, and manage patient records
- **👨‍⚕️ Doctor Management**: Manage doctor profiles and specialties
- **📅 Appointment Scheduling**: Book and track medical appointments
- **💰 Billing System**: Generate and manage medical bills
- **📝 Medical Records**: Maintain comprehensive patient medical history
- **📊 Dashboard**: Overview of key hospital metrics

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Routing**: Wouter
- **Build Tool**: Vite
- **Deployment**: GitHub Pages

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- pnpm (or npm/yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/Donald28-gum/hospital-management-system.git
cd hospital-management-system

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The application will be available at `http://localhost:3000`

## 📦 Building for Production

```bash
# Build the project
pnpm run build

# Preview the production build
pnpm run preview
```

## 🚢 Deployment

The project is configured for automatic deployment to GitHub Pages.

```bash
# Deploy to GitHub Pages
pnpm run deploy
```

This will build the project and push it to the `gh-pages` branch.

## 📁 Project Structure

```
hospital-management-system/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HospitalManagementSystem.tsx  (Main component)
│   │   │   ├── Home.tsx
│   │   │   └── NotFound.tsx
│   │   ├── components/
│   │   │   └── ui/                          (shadcn/ui components)
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   └── index.html
├── server/
├── shared/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🔐 Security Features

- Secure password hashing
- Admin-only access control
- Session management
- Input validation

## 📝 License

MIT

## 👤 Author

Created with ❤️ by Skip

---

**Live Demo:** [https://donald28-gum.github.io/hospital-management-system/](https://donald28-gum.github.io/hospital-management-system/)
