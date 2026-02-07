import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './i18n';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import News from './pages/News';
import PostDetails from './pages/PostDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import { MembershipForm } from './pages/memberShipForm';
import Candidates from './pages/Candidates';
import CandidateDetailPage from './pages/CandidateDetailNew';
import CandidateRegistrationForm from './pages/CandidateRegistrationForm';
import FeedbackPage from './pages/Feedback';
import Polls from './pages/Polls';
import PollDetail from './pages/PollDetail';
import { useEffect } from 'react';

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

const App = () => (
  <QueryClientProvider client={queryClient}>

    <TooltipProvider>

      <Toaster />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Routes>
            {/* Admin route without header/footer */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Regular routes with header/footer */}
            <Route path="/*" element={
              <>
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/post/:id" element={<PostDetails />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/candidates" element={<Candidates />} />
                    <Route path="/candidate/:id" element={<CandidateDetailPage />} />
                    <Route path="/polls" element={<Polls />} />
                    <Route path="/polls/:id" element={<PollDetail />} />
                    <Route path="/candidate-registration" element={<CandidateRegistrationForm />} />
                    <Route path="/membership-form" element={<MembershipForm />} />
                    <Route path="/feedback" element={<FeedbackPage />} />
                    <Route path="*" element={<NotFound />} />
                         {/* <ScrollToTop />  */}
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;