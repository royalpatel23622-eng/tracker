import './globals.css';

export const metadata = {
  title: 'StudyBuddy — Your Tracker',
  description: 'Personalized study tracker with timetable, tick system, achievements & Telegram',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#FF7F7F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="StudyBuddy" />
      </head>
      <body>{children}</body>
    </html>
  );
}
