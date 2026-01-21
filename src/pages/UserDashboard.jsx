import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, TrendingUp, TrendingDown, X, ChevronLeft, ChevronRight, Filter, Sun, Moon } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const UserDashboard = () => {
  const navigate = useNavigate();

  // --- MOCK DATA: GRAFIK SALDO ---
  const chartData = [
    { time: '08:00', balance: 1000 },
    { time: '10:00', balance: 1050 },
    { time: '12:00', balance: 1030 },
    { time: '14:00', balance: 1100 },
    { time: '16:00', balance: 1080 },
    { time: '18:00', balance: 1150 },
    { time: '20:00', balance: 1200 },
  ];

  // --- MOCK DATA: HISTORY TRANSAKSI (25 Data) ---
  const historyData = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    date: `2023-10-${25 - i}`,
    pair: i % 2 === 0 ? "XAUUSD" : "EURUSD",
    type: i % 3 === 0 ? "SELL" : "BUY",
    profit: (Math.random() * 200 - 50).toFixed(2)
  }));

  // --- STATE THEME ---
  const [theme, setTheme] = useState('light'); // default: light
  
  // --- STATE USER ---
  const [userProfile, setUserProfile] = useState({
    name: "Jefri Wahyudiana",
    phone: "08123456789",
    magicNumber: "88888",
    password: "user123"
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditProfile, setIsEditProfile] = useState(false);

  // --- STATE FILTER & PAGINATION ---
  const [showFilter, setShowFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- LOGIKA SALDO ---
  // Ganti ke angka negatif (misal -500) untuk mengetes warna merah!
  const currentBalance = 1200.00; 
  const isNegative = currentBalance < 0;

  // LOGIKA PAGINATION
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historyData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(historyData.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // LOGIKA STATISTIK
  const maxProfit = Math.max(...historyData.map(d => parseFloat(d.profit)));
  const maxLoss = Math.min(...historyData.map(d => parseFloat(d.profit)));

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 font-sans relative transition-colors duration-300 ${
      theme === 'light' 
        ? 'bg-gray-50 text-gray-900' 
        : 'bg-slate-950 text-slate-100'
    }`}>
      
      {/* --- HEADER --- */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-2xl font-bold ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>Dashboard User</h1>
          <p className={`text-sm ${
            theme === 'light' ? 'text-gray-600' : 'text-slate-400'
          }`}>Selamat datang, {userProfile.name}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              theme === 'light' 
                ? 'bg-gray-200 hover:bg-gray-300 border border-gray-300 text-gray-700' 
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white'
            }`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            <span className="hidden md:inline">{theme === 'light' ? 'Gelap' : 'Terang'}</span>
          </button>
          <button 
            onClick={() => setShowProfileModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              theme === 'light' 
                ? 'bg-gray-200 hover:bg-gray-300 border border-gray-300 text-gray-700' 
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white'
            }`}
          >
            <User size={18} />
            <span className="hidden md:inline">Profil</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Keluar</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- KOLOM UTAMA --- */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* 1. Card Grafik Saldo (REVISI: ANGKA MASUK DALAM BADGE) */}
          <div className={`rounded-xl p-6 shadow-xl relative ${
            theme === 'light' 
              ? 'bg-white border border-gray-200' 
              : 'bg-slate-900 border border-slate-800'
          }`}>
             <div className="flex justify-between items-center mb-6">
                
                {/* Judul di Kiri */}
                <h3 className={`text-lg font-semibold ${
                  theme === 'light' ? 'text-gray-700' : 'text-slate-300'
                }`}>Grafik Saldo</h3>
                
                {/* Saldo DI DALAM BADGE (Menggantikan Text 'Live') */}
                <div className={`flex items-center gap-3 px-5 py-2 rounded-full border transition-colors shadow-lg ${
                    isNegative 
                      ? 'bg-red-500/10 border-red-500/20 shadow-red-900/10' 
                      : 'bg-green-500/10 border-green-500/20 shadow-green-900/10'
                }`}>
                   {/* Titik Berkedip */}
                   <span className="relative flex h-3 w-3">
                       <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                           isNegative ? 'bg-red-400' : 'bg-green-400'
                       }`}></span>
                       <span className={`relative inline-flex rounded-full h-3 w-3 ${
                           isNegative ? 'bg-red-500' : 'bg-green-500'
                       }`}></span>
                   </span>

                   {/* Angka Saldo (Warna Mengikuti Status - BUKAN PUTIH) */}
                   <span className={`text-xl font-bold font-mono tracking-wide ${
                       isNegative ? 'text-red-400' : 'text-green-400'
                   }`}>
                     ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                   </span>
                </div>
             </div>
             
             {/* Area Chart */}
             <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isNegative ? "#ef4444" : "#3b82f6"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={isNegative ? "#ef4444" : "#3b82f6"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e5e7eb' : '#1e293b'} vertical={false} />
                  <XAxis dataKey="time" stroke={theme === 'light' ? '#6b7280' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={theme === 'light' ? '#6b7280' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 50', 'dataMax + 50']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: theme === 'light' ? '#fff' : '#0f172a', borderColor: theme === 'light' ? '#e5e7eb' : '#1e293b', color: theme === 'light' ? '#000' : '#fff' }}
                    itemStyle={{ color: isNegative ? '#ef4444' : '#3b82f6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke={isNegative ? "#ef4444" : "#3b82f6"} 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorBalance)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Statistik & Filter Area (Tetap Sama) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl flex items-center gap-4 ${
              theme === 'light' 
                ? 'bg-white border border-gray-200' 
                : 'bg-slate-900 border border-slate-800'
            }`}>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <TrendingUp className="text-green-500" size={24} />
              </div>
              <div>
                <p className={`text-xs ${
                  theme === 'light' ? 'text-gray-600' : 'text-slate-400'
                }`}>Profit Terbesar (Hari Ini)</p>
                <p className="text-xl font-bold text-green-400">+${maxProfit}</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl flex items-center gap-4 ${
              theme === 'light' 
                ? 'bg-white border border-gray-200' 
                : 'bg-slate-900 border border-slate-800'
            }`}>
              <div className="bg-red-500/10 p-3 rounded-lg">
                <TrendingDown className="text-red-500" size={24} />
              </div>
              <div>
                <p className={`text-xs ${
                  theme === 'light' ? 'text-gray-600' : 'text-slate-400'
                }`}>Rugi Terbesar (Hari Ini)</p>
                <p className="text-xl font-bold text-red-400">${maxLoss}</p>
              </div>
            </div>

            {/* FILTER HARI BUTTON */}
            <div className="relative z-10">
                <button 
                    onClick={() => setShowFilter(!showFilter)}
                    className={`w-full h-full rounded-xl flex flex-col items-center justify-center gap-2 p-4 transition-all active:scale-95 ${
                      theme === 'light' 
                        ? 'bg-gray-200 hover:bg-gray-300 border border-gray-300 text-gray-900' 
                        : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white'
                    }`}
                >
                    <Filter size={20} className="text-blue-400"/>
                    <span className="font-semibold">Filter Hari</span>
                    {selectedDate && <span className="text-xs text-blue-400">Terpilih: {selectedDate}</span>}
                </button>

                {showFilter && (
                    <div className={`absolute top-full mt-2 right-0 left-0 rounded-xl p-4 shadow-2xl ${
                      theme === 'light' 
                        ? 'bg-white border border-gray-200' 
                        : 'bg-slate-900 border border-slate-700'
                    }`}>
                        <div className={`text-xs mb-2 text-center ${
                          theme === 'light' ? 'text-gray-600' : 'text-slate-400'
                        }`}>Pilih Tanggal</div>
                        <div className="grid grid-cols-5 gap-2">
                            {[...Array(15)].map((_, i) => (
                                <button 
                                key={i} 
                                onClick={() => {
                                    setSelectedDate(i + 1);
                                    setShowFilter(false);
                                }}
                                className={`aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all
                                    ${selectedDate === i + 1 
                                      ? 'bg-blue-600 text-white' 
                                      : theme === 'light'
                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }
                                `}
                                >
                                {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>

          {/* 3. Tabel History (Tetap Sama) */}
          <div className={`rounded-xl overflow-hidden ${
            theme === 'light' 
              ? 'bg-white border border-gray-200' 
              : 'bg-slate-900 border border-slate-800'
          }`}>
             <div className={`px-6 py-4 flex justify-between items-center ${
               theme === 'light' 
                 ? 'border-b border-gray-200' 
                 : 'border-b border-slate-800'
             }`}>
                <h3 className={`font-semibold ${
                  theme === 'light' ? 'text-gray-700' : 'text-slate-300'
                }`}>Riwayat Transaksi</h3>
                <span className={`text-xs ${
                  theme === 'light' ? 'text-gray-500' : 'text-slate-500'
                }`}>Total: {historyData.length} Data</span>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className={theme === 'light' ? 'bg-gray-50 text-gray-600' : 'bg-slate-950 text-slate-400'}>
                    <tr>
                        <th className="px-6 py-3">No</th>
                        <th className="px-6 py-3">Waktu</th>
                        <th className="px-6 py-3">Pair</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3 text-right">Profit</th>
                    </tr>
                    </thead>
                    <tbody className={theme === 'light' ? 'divide-y divide-gray-200' : 'divide-y divide-slate-800'}>
                    {currentItems.map((tx, index) => (
                        <tr key={tx.id} className={theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-slate-800/50'}>
                        <td className={`px-6 py-3 ${
                          theme === 'light' ? 'text-gray-500' : 'text-slate-500'
                        }`}>{indexOfFirstItem + index + 1}</td>
                        <td className={`px-6 py-3 ${
                          theme === 'light' ? 'text-gray-600' : 'text-slate-400'
                        }`}>{tx.date}</td>
                        <td className="px-6 py-3 font-medium">{tx.pair}</td>
                        <td className="px-6 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${tx.type === 'BUY' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                            {tx.type}
                            </span>
                        </td>
                        <td className={`px-6 py-3 text-right font-bold ${parseFloat(tx.profit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {parseFloat(tx.profit) >= 0 ? '+' : ''}{tx.profit}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
             </div>

             <div className={`px-6 py-4 flex justify-between items-center ${
               theme === 'light' 
                 ? 'border-t border-gray-200 bg-gray-50' 
                 : 'border-t border-slate-800 bg-slate-950'
             }`}>
                 <button 
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-lg border transition-all
                        ${currentPage === 1 
                            ? theme === 'light'
                              ? 'bg-transparent border-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-transparent border-slate-800 text-slate-600 cursor-not-allowed' 
                            : theme === 'light'
                              ? 'bg-gray-200 border-gray-300 text-gray-900 hover:bg-gray-300'
                              : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'}
                    `}
                 >
                    <ChevronLeft size={16} />
                    Previous
                 </button>

                 <span className={`text-xs ${
                   theme === 'light' ? 'text-gray-600' : 'text-slate-500'
                 }`}>
                    Halaman {currentPage} dari {totalPages}
                 </span>

                 <button 
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-lg border transition-all
                        ${currentPage === totalPages
                            ? theme === 'light'
                              ? 'bg-transparent border-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-transparent border-slate-800 text-slate-600 cursor-not-allowed' 
                            : theme === 'light'
                              ? 'bg-gray-200 border-gray-300 text-gray-900 hover:bg-gray-300'
                              : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'}
                    `}
                 >
                    Next
                    <ChevronRight size={16} />
                 </button>
             </div>
          </div>

        </div>

      </div>

      {/* --- MODAL PROFIL (Tetap Sama) --- */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in px-4">
           <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
             theme === 'light' 
               ? 'bg-white border border-gray-200' 
               : 'bg-slate-900 border border-slate-700'
           }`}>
             <div className={`px-6 py-4 flex justify-between items-center ${
               theme === 'light' 
                 ? 'bg-gray-100 border-b border-gray-200' 
                 : 'bg-slate-800 border-b border-slate-700'
             }`}>
               <h3 className={`text-lg font-bold ${
                 theme === 'light' ? 'text-gray-900' : 'text-white'
               }`}>Profil Akun</h3>
               <button onClick={() => {setShowProfileModal(false); setIsEditProfile(false)}} className={theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-slate-400 hover:text-white'}>
                 <X size={20} />
               </button>
             </div>

             <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-xs font-medium uppercase mb-1 ${
                    theme === 'light' ? 'text-gray-600' : 'text-slate-500'
                  }`}>Nama Lengkap</label>
                  <input 
                    type="text" 
                    disabled={!isEditProfile}
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none ${
                      theme === 'light'
                        ? `bg-gray-50 ${isEditProfile ? 'border-blue-500' : 'border-gray-300'} text-gray-900`
                        : `bg-slate-950 ${isEditProfile ? 'border-blue-500' : 'border-slate-800'} text-white`
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium uppercase mb-1 ${
                    theme === 'light' ? 'text-gray-600' : 'text-slate-500'
                  }`}>No. Handphone</label>
                  <input 
                    type="text" 
                    disabled={!isEditProfile}
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none ${
                      theme === 'light'
                        ? `bg-gray-50 ${isEditProfile ? 'border-blue-500' : 'border-gray-300'} text-gray-900`
                        : `bg-slate-950 ${isEditProfile ? 'border-blue-500' : 'border-slate-800'} text-white`
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium uppercase mb-1 ${
                    theme === 'light' ? 'text-gray-600' : 'text-slate-500'
                  }`}>Password</label>
                  <input 
                    type="password" 
                    disabled={!isEditProfile}
                    value={userProfile.password}
                    onChange={(e) => setUserProfile({...userProfile, password: e.target.value})}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none ${
                      theme === 'light'
                        ? `bg-gray-50 ${isEditProfile ? 'border-blue-500' : 'border-gray-300'} text-gray-900`
                        : `bg-slate-950 ${isEditProfile ? 'border-blue-500' : 'border-slate-800'} text-white`
                    }`}
                  />
                </div>
                 <div>
                  <label className={`block text-xs font-medium uppercase mb-1 ${
                    theme === 'light' ? 'text-gray-600' : 'text-slate-500'
                  }`}>Magic Number (Permanent)</label>
                  <input 
                    type="text" 
                    disabled={true} 
                    value={userProfile.magicNumber}
                    className={`w-full border rounded-lg px-4 py-3 cursor-not-allowed ${
                      theme === 'light'
                        ? 'bg-gray-200 border-gray-300 text-gray-500'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  {!isEditProfile ? (
                    <button 
                      onClick={() => setIsEditProfile(true)}
                      className="w-full bg-white text-slate-900 font-bold py-3 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Edit Profil
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => setIsEditProfile(false)}
                        className={`flex-1 font-bold py-3 rounded-lg transition-colors ${
                          theme === 'light'
                            ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                            : 'bg-slate-800 text-white hover:bg-slate-700'
                        }`}
                      >
                        Batal
                      </button>
                      <button 
                        onClick={() => {
                          setIsEditProfile(false);
                          alert("Data profil berhasil disimpan!");
                        }}
                        className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Simpan
                      </button>
                    </>
                  )}
                </div>
             </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;