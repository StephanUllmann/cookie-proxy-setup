import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import RegisterForm from './pages/Register';
import Books from './pages/Books';
import ReadingList from './pages/ReadingList';
import ProtectedLayout from './layouts/ProtectedLayout';
import './utils/index';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="register" element={<RegisterForm />} />

        <Route element={<ProtectedLayout />}>
          <Route path="books" element={<Books />} />
          <Route path="reading-list" element={<ReadingList />} />
        </Route>

        <Route path="*" element={<h1>Page not found</h1>} />
      </Route>
    </Routes>
  );
}

export default App;
