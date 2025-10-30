# Co-Grader Frontend

A modern image processing application built with Next.js that allows users to upload images, process them, and view results in real-time.

## 🚀 Features

- **Image Upload**: Submit images via URL for processing
- **Real-time Updates**: Monitor processing status live with Firebase Realtime Database
- **Image Comparison**: View original and processed images side-by-side
- **Internationalization**: Support for English and Portuguese (Brazil) with flag toggles
- **Dark Mode**: Full dark mode support
- **Responsive Design**: Mobile-first design that works on all devices
- **Progress Tracking**: Real-time progress bar for each image processing job

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Database**: [Firebase Realtime Database](https://firebase.google.com/products/realtime-database)
- **Language**: TypeScript
- **Image Processing API**: Hosted on Google Cloud Run

## 📋 Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cograder-front
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🌐 API Endpoint

The application connects to the Co-Grader API hosted on Google Cloud Run:

**API Base URL**: `https://cograder-api-2057331207.southamerica-east1.run.app/`

## 📱 How to Use

1. **Add New Image**: Click the blue "+" button in the bottom-right corner
2. **Submit URL**: Paste an image URL and wait for validation
3. **Preview**: View the image preview before submitting
4. **Submit**: Click "Submit" to start processing
5. **Monitor**: Watch real-time progress updates
6. **Compare**: View original and processed (grayscale with watermark) images side-by-side

## 🌍 Internationalization

Toggle between languages using the flag icon in the top navigation:
- 🇧🇷 Portuguese (Brazil)
- 🇺🇸 English

## 🎨 Dark Mode

Toggle dark mode using the sun/moon icon in the top navigation.

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🔥 Firebase Configuration

The app uses Firebase Realtime Database for real-time updates. Firebase configuration is included in the codebase. For production, consider using environment variables.

## 📄 License

This project is part of the Co-Grader system.
