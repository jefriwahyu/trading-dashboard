import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
        <Routes>
          {/* Rute Awal: Login */}
          <Route path="/" element={<Login />} />
          
          {/* Rute Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Rute User */}
          <Route path="/user" element={<UserDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;