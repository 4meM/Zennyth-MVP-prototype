import type { Metadata, Viewport } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { ShellLayout } from "@/components/layout/shell";
import { ThemeProvider } from "@/components/layout/theme-provider";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8ff" },
    { media: "(prefers-color-scheme: dark)", color: "#121018" },
  ],
};

export const metadata: Metadata = {
  title: "Zennyth - Study Flow",
  description:
    "Asistente inteligente de productividad para estudiantes universitarios",
  manifest: "/manifest.json",
  applicationName: "Zennyth",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zennyth - Study Flow",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={nunitoSans.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem('zennyth-theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased transition-colors duration-300">
        <ThemeProvider>
          <ShellLayout>{children}</ShellLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
