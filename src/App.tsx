import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/hooks/useAuth';
import Login from './pages/Login';
import Home from './pages/Home';
import Transfer from './pages/Transfer';
import TransactionHistory from './pages/TransactionHistory';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route path="/history" element={<TransactionHistory />} />
      </Route>
    </Routes>
  );
}

export default App;