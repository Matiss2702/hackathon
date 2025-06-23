import { AuthProvider } from '@/context/AuthContext';
import './globals.css';
import { Roboto } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Main from '@/components/main';

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'auto',
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  fallback: ['arial', 'system-ui', 'sans-serif'],
});

export const metadata = {
  title: {
    default: 'Geolock',
    template: 'Geolock | %s',
  },
  description: 'GPS for everyone',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${roboto.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="h-screen overflow-y-auto flex flex-col">
              <Header />
              <Main>{children}</Main>
              <Footer />
              <Toaster />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
