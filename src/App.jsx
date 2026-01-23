import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Pintu Utama */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Pintu Khusus User/Trader */}
        <Route path="/dashboard" element={<UserDashboard />} />
        
        {/* Pintu Khusus Admin */}
        <Route path="/admin" element={<AdminDashboard />} /> 

        {/* Jika nyasar, balikkan ke Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;