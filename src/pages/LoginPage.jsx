import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Sun, Moon, Loader2 } from "lucide-react";
// 1. Import Apollo Hook
import { useLazyQuery, gql } from '@apollo/client';

// 2. Query ke Database (PASTIKAN field 'password' ADA DI SINI)
const GET_USER = gql`
  query GetUser($magicNumber: String!) {
    user(magicNumber: $magicNumber) {
      id
      name
      magicNumber
      password  # Field ini wajib ada agar bisa dibandingkan
      role
      balance
    }
  }
`;

const LoginPage = () => {
  const navigate = useNavigate();
  
  // State untuk UI dan Input
  const [theme, setTheme] = useState('light');
  const [magicNumber, setMagicNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 3. Hook Apollo untuk mengambil data user
  const [getUser, { loading }] = useLazyQuery(GET_USER, {
    fetchPolicy: "network-only", // Mengambil data paling segar dari PostgreSQL
    onCompleted: (data) => {
      const user = data.user;

      if (user) {
        // --- LOGIKA VALIDASI PASSWORD ---
        // Membandingkan input di form dengan password asli di DB
        if (user.password !== password) {
          setError("Password salah bosku!"); // Muncul jika tidak cocok
          return;
        }

        // BERHASIL: Simpan data user ke localStorage
        localStorage.setItem("userData", JSON.stringify(user));

        // --- LOGIKA REDIRECT BERDASARKAN ROLE ---
        if (user.role === 'ADMIN') { 
          navigate("/admin"); // Jika Admin, ke DashboardAdmin
        } else {
          navigate("/dashboard"); // Jika User, ke UserDashboard
        }
      } else {
        setError("Magic Number tidak terdaftar di Database!");
      }
    },
    onError: (err) => {
      setError("Gagal konek ke server. Pastikan backend nyala!");
      console.error(err);
    }
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setError(""); // Reset error setiap klik login

    if (!magicNumber || !password) {
      setError("Magic Number dan Password wajib diisi!");
      return;
    }

    // Eksekusi pencarian user berdasarkan Magic Number
    getUser({ variables: { magicNumber } });
  };

  return (
    <div className={`flex items-center justify-center min-h-screen px-4 transition-colors duration-300 ${
      theme === 'light' ? 'bg-gray-50' : 'bg-slate-950'
    }`}>
      {/* Tombol Ganti Tema */}
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

      {/* Form Login */}
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

        {/* Pesan Error */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'light' ? 'text-gray-700' : 'text-slate-400'
            }`}>
              Magic Number
            </label>
            <input
              type="text"
              placeholder="Masukkan Magic Number"
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-all ${
                theme === 'light'
                  ? 'bg-gray-50 border-gray-300 text-gray-900'
                  : 'bg-slate-950 border-slate-800 text-white'
              }`}
              value={magicNumber}
              onChange={(e) => setMagicNumber(e.target.value)}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'light' ? 'text-gray-700' : 'text-slate-400'
            }`}>
              Password
            </label>
            <input
              type="password"
              placeholder="Masukkan Password"
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-all ${
                theme === 'light'
                  ? 'bg-gray-50 border-gray-300 text-gray-900'
                  : 'bg-slate-950 border-slate-800 text-white'
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-3 rounded-lg transition-colors active:scale-95 flex justify-center items-center gap-2 ${
              theme === 'light'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white text-slate-900 hover:bg-slate-200'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Login Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;