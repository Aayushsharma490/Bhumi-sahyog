import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import { LanguageProvider } from './context/LanguageContext';
import ScrollToTop from './components/ScrollToTop';
import ScrollProvider from './components/ScrollProvider';
import CustomCursor from './components/CustomCursor';
import AnimatedRoutes from './components/AnimatedRoutes';

export default function App() {
  return (
    <BrowserRouter>
      {/* 1. Global English/Hindi Language Provider */}
      <LanguageProvider>
        {/* 2. Scroll-To-Top On Page Change */}
        <ScrollToTop />
        {/* 3. Butter-Smooth Scroll with Lenis + GSAP ScrollTrigger */}
        <ScrollProvider>
          {/* 4. Dual-Element Custom Cursor with Lagging Ring */}
          <CustomCursor />
          {/* 5. Authentication Provider */}
          <AuthProvider>
            {/* 6. Instant SPA Page Transitions (0 Reload Delay) */}
            <main className="min-h-screen">
              <AnimatedRoutes />
            </main>
          </AuthProvider>
        </ScrollProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
