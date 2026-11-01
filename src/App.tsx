import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@project/components/ui/sonner';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import BuildPage from './pages/BuildPage';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import MyLearning from './pages/MyLearning';
import SourcePage from './pages/SourcePage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/build" element={<BuildPage />} />
            <Route path="/course/:courseId" element={<CoursePage />} />
            <Route path="/course/:courseId/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/my-learning" element={<MyLearning />} />
            <Route path="/source" element={<SourcePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
