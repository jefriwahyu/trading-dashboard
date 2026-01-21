import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Sun, Moon } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  
  // State theme
  const [theme, setTheme] = useState('light'); // default: light
  
  // State untuk menyimpan inputan user
  const [magicNumber, setMagicNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Untuk notifikasi gagal login

  // Fungsi saat tombol Login ditekan
  const handleLogin = (e) => {
    e.preventDefault(); // Mencegah reload halaman

    // LOGIKA SEMENTARA (MOCK)
    // Nanti ini diganti dengan request ke Backend
    if (magicNumber === "admin" && password === "admin123") {
      navigate("/admin"); // Lempar ke dashboard admin
    } else if (magicNumber === "12345" && password === "user123") {
      navigate("/user"); // Lempar ke dashboard user
    } else {
      setError("Magic Number atau Password salah!");
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen px-4 transition-colors duration-300 ${
      theme === 'light' ? 'bg-gray-50' : 'bg-slate-950'
    }`}>
      {/* Toggle Theme Button */}
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className={`fixed top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          theme === 'light'
            ? 'bg-gray-200 hover:bg-gray-300 border border-gray-300 text-gray-700'
            : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white'
        }`}
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        <span className="hidden md:inline">{theme === 'light' ? 'Gelap' : 'Terang'}</span>
      </button>

      {/* Card Container */}
      <div className={`w-full max-w-md rounded-2xl shadow-2xl p-8 ${
        theme === 'light'
          ? 'bg-white border border-gray-200'
          : 'bg-slate-900 border border-slate-800'
      }`}>
        
        <h2 className={`text-2xl font-bold text-center mb-8 ${
          theme === 'light' ? 'text-gray-900' : 'text-white'
        }`}>
          Trading System
        </h2>

        {/* Notifikasi Error (Sesuai Wireframe) */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Input Magic Number */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'light' ? 'text-gray-700' : 'text-slate-400'
            }`}>
              Magic Number
            </label>
            <input
              type="text"
              placeholder="Masukkan Magic Number"
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                theme === 'light'
                  ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                  : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
              }`}
              value={magicNumber}
              onChange={(e) => setMagicNumber(e.target.value)}
            />
          </div>

          {/* Input Password */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'light' ? 'text-gray-700' : 'text-slate-400'
            }`}>
              Password
            </label>
            <input
              type="password"
              placeholder="Masukkan Password"
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                theme === 'light'
                  ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                  : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Tombol Login */}
          <button
            type="submit"
            className={`w-full font-bold py-3 rounded-lg transition-colors active:scale-95 transform duration-100 ${
              theme === 'light'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white text-slate-900 hover:bg-slate-200'
            }`}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;