import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  TrendingUp,
  TrendingDown,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sun,
  Moon,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMutation, useQuery, gql } from "@apollo/client";

// Mengambil data user
const GET_USER_DATA = gql`
  query GetUserData($magicNumber: String!) {
    user(magicNumber: $magicNumber) {
      id
      name
      phone
      balance
      magicNumber
      initialBalance
      logs {
        id
        ticket
        symbol
        type
        lots
        profit
        createdAt
      }
    }
  }
`;

// GraphQL Mutation untuk Update User
const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: Int!
    $name: String
    $phone: String
    $password: String
    $initialBalance: Float
  ) {
    updateUser(
      id: $id
      name: $name
      phone: $phone
      password: $password
      initialBalance: $initialBalance
    ) {
      id
      name
      phone
      password
      initialBalance
    }
  }
`;

const UserDashboard = () => {
  const navigate = useNavigate();

  // --- 1. STATE USER (Diisi Default Dulu) ---
  const [userProfile, setUserProfile] = useState({
    name: "Loading...",
    phone: "",
    magicNumber: "...",
    password: "", // Password tidak ditampilkan demi keamanan biasanya, tapi kita simpan di state
    balance: 0, // Saldo default 0
  });
  
  const [originalPassword, setOriginalPassword] = useState(""); // Simpan password asli
  const [originalData, setOriginalData] = useState({ name: "", phone: "" }); // Simpan data asli untuk perbandingan

  // Ambil magicNumber dari localStorage
  const savedData = JSON.parse(localStorage.getItem("userData") || "{}");

  // --- AMBIL DATA REAL DARI DATABASE ---
  const { data, loading, error } = useQuery(GET_USER_DATA, {
    variables: { magicNumber: savedData.magicNumber },
    pollInterval: 3000, // Cek data baru setiap 3 detik (Auto Refresh!)
  });

  // --- 2. EFEK: AMBIL DATA ASLI DARI LOGIN (INTEGRASI BACKEND) ---
  useEffect(() => {
    // Ambil data dari LocalStorage (yang disimpan saat Login tadi)
    const dataString = localStorage.getItem("userData");

    if (dataString) {
      const userData = JSON.parse(dataString);

      // Simpan password asli
      setOriginalPassword(userData.password || "");

      // Simpan data asli
      setOriginalData({
        name: userData.name,
        phone: userData.phone || "",
      });

      // Update State dengan Data Asli Database
      setUserProfile({
        name: userData.name,
        phone: userData.phone || "0812xxxx",
        magicNumber: userData.magicNumber,
        balance: userData.balance || 0,
        password: "****************", // Password disensor
      });
    } else {
      // Kalau tidak ada data login, tendang ke halaman depan
      navigate("/");
    }
  }, [navigate]);

  // --- 3. UPDATE USERPROFILE DARI DATA GRAPHQL ---
  useEffect(() => {
    if (data?.user) {
      setUserProfile((prev) => ({
        ...prev,
        name: data.user.name,
        phone: data.user.phone || "",
        magicNumber: data.user.magicNumber,
        balance: data.user.balance || 0,
      }));

      // Update initial balance dari database
      setInitialBalance(data.user.initialBalance || 0);

      // Update original data juga
      setOriginalData({
        name: data.user.name,
        phone: data.user.phone || "",
      });
    }
  }, [data]);

  // --- DATA REAL DARI DATABASE ---
  const historyData = data?.user?.logs || [];

  // --- STATE THEME & UI ---
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditProfile, setIsEditProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // State untuk Saldo Awal (dari database)
  const [initialBalance, setInitialBalance] = useState(0);
  const [showInitialBalanceModal, setShowInitialBalanceModal] = useState(false);
  const [tempInitialBalance, setTempInitialBalance] = useState("");

  // State untuk PnL Toggle (persen/angka)
  const [showPnLAsPercentage, setShowPnLAsPercentage] = useState(true);

  // Fungsi untuk menampilkan notifikasi
  const showNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto remove setelah 5 detik
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 5000);
  };

  // GraphQL Mutation Hook
  const [updateUser] = useMutation(UPDATE_USER, {
    onCompleted: (data) => {
      // Update localStorage dengan data baru
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const updatedData = {
        ...userData,
        name: data.updateUser.name,
        phone: data.updateUser.phone,
        password: data.updateUser.password,
      };
      localStorage.setItem("userData", JSON.stringify(updatedData));

      // Update password asli
      setOriginalPassword(data.updateUser.password);

      // Update originalData untuk perbandingan selanjutnya
      setOriginalData({
        name: data.updateUser.name,
        phone: data.updateUser.phone,
      });

      // Update state lokal
      setUserProfile({
        ...userProfile,
        name: data.updateUser.name,
        phone: data.updateUser.phone,
        password: "****************",
      });

      setIsEditProfile(false);
      setShowPassword(false);
      showNotification("Profil berhasil diperbarui!", "success");
    },
    onError: (err) => {
      showNotification("Gagal memperbarui profil: " + err.message, "error");
    },
  });

  // Sync tema ke localStorage
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Cek saldo awal setelah login
  useEffect(() => {
    const checkInitialBalance = setTimeout(() => {
      if (initialBalance === 0 && data?.user) {
        setShowInitialBalanceModal(true);
      }
    }, 1000); // 1 detik setelah login

    return () => clearTimeout(checkInitialBalance);
  }, [initialBalance, data]);

  // --- STATE FILTER & PAGINATION ---
  const [showFilter, setShowFilter] = useState(false);
  const [filterMode, setFilterMode] = useState("day"); // 'day', 'month', 'year'
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- LOGIKA SALDO (MENGGUNAKAN DATA REAL DARI DATABASE) ---
  const currentBalance = data?.user?.balance || 0;
  // Saldo negatif jika saldo sekarang < saldo awal (Loss)
  const isNegative = currentBalance < initialBalance;

  // LOGIKA FILTER DATA
  const filteredHistory = historyData.filter((item) => {
    // Konversi string tanggal dari database ke objek Date Javascript
    const itemDate = new Date(parseInt(item.createdAt));

    if (isNaN(itemDate.getTime())) return false; // Hindari Invalid Date

    const itemDay = itemDate.getDate();
    const itemMonth = itemDate.getMonth() + 1;
    const itemYear = itemDate.getFullYear();

    const today = new Date();

    // DEFAULT: Jika tidak ada filter, tampilkan data HARI INI saja
    if (!filterDay && !filterMonth && !filterYear) {
      return (
        itemDay === today.getDate() &&
        itemMonth === today.getMonth() + 1 &&
        itemYear === today.getFullYear()
      );
    }

    // Logika filter sesuai pilihan user
    if (filterMode === "day") {
      return (
        (!filterDay || itemDay === parseInt(filterDay)) &&
        (!filterMonth || itemMonth === parseInt(filterMonth)) &&
        (!filterYear || itemYear === parseInt(filterYear))
      );
    } else if (filterMode === "month") {
      return (
        (!filterMonth || itemMonth === parseInt(filterMonth)) &&
        (!filterYear || itemYear === parseInt(filterYear))
      );
    } else if (filterMode === "year") {
      return !filterYear || itemYear === parseInt(filterYear);
    }

    return true;
  });

  // Urutkan dari entry terbaru ke terlama
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    return parseInt(b.createdAt) - parseInt(a.createdAt);
  });

  // LOGIKA PAGINATION (menggunakan sorted filtered data)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedHistory.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Reset halaman ke 1 saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDay, filterMonth, filterYear, filterMode]);

  // --- GRAFIK SALDO DINAMIS (Running Balance) ---
  const chartData = useMemo(() => {
    // Ambil 7 transaksi terakhir yang sudah difilter
    const last7Logs = [...filteredHistory]
      .sort((a, b) => parseInt(a.createdAt) - parseInt(b.createdAt))
      .slice(-7);

    // Hitung saldo di awal 7 transaksi ini
    // Total profit dari semua transaksi sebelum 7 transaksi terakhir
    const logsBeforeLast7 = [...filteredHistory]
      .sort((a, b) => parseInt(a.createdAt) - parseInt(b.createdAt))
      .slice(0, -7);

    const profitBeforeLast7 = logsBeforeLast7.reduce(
      (sum, log) => sum + parseFloat(log.profit),
      0,
    );

    let runningBalance = initialBalance + profitBeforeLast7;

    return last7Logs.map((log) => {
      runningBalance += parseFloat(log.profit);
      return {
        time: new Date(parseInt(log.createdAt)).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        balance: runningBalance,
      };
    });
  }, [filteredHistory, currentBalance, initialBalance]);

  // LOGIKA STATISTIK (Total Akumulasi Profit/Loss dalam periode)
  const totalProfitInPeriod = filteredHistory
    .filter((log) => parseFloat(log.profit) > 0)
    .reduce((sum, log) => sum + parseFloat(log.profit), 0);

  const totalLossInPeriod = filteredHistory
    .filter((log) => parseFloat(log.profit) < 0)
    .reduce((sum, log) => sum + parseFloat(log.profit), 0);

  // PnL Total (Keuntungan Bersih) dalam periode yang difilter
  const totalPnL = filteredHistory.reduce(
    (sum, log) => sum + parseFloat(log.profit),
    0,
  );

  // PnL Total untuk semua transaksi (default - tidak terpengaruh filter)
  const totalPnLAllTime = historyData.reduce(
    (sum, log) => sum + parseFloat(log.profit),
    0,
  );

  // Tentukan PnL yang akan ditampilkan (jika ada filter, gunakan filtered, jika tidak, gunakan all time)
  const displayPnL =
    filterDay || filterMonth || filterYear ? totalPnL : totalPnLAllTime;
  const isPnLPositive = displayPnL >= 0;

  // Hitung PnL dalam persentase (PnL / Saldo Awal * 100)
  const pnlPercentage =
    initialBalance !== 0 ? (displayPnL / initialBalance) * 100 : 0;

  // Label dinamis untuk filter
  const getFilterLabel = () => {
    if (!filterDay && !filterMonth && !filterYear) return "Hari Ini";
    if (filterMode === "day" && filterDay && filterMonth && filterYear) {
      return `${filterDay}/${filterMonth}/${filterYear}`;
    }
    if (filterMode === "month" && filterMonth && filterYear) {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agt",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];
      return `${months[parseInt(filterMonth) - 1]} ${filterYear}`;
    }
    if (filterMode === "year" && filterYear) {
      return `Tahun ${filterYear}`;
    }
    return "Hari Ini";
  };

  const handleLogout = () => {
    localStorage.removeItem("userData"); // Hapus sesi login
    navigate("/", { replace: true }); // Replace history agar tidak bisa back
  };

  // Fungsi untuk menyimpan saldo awal ke database
  const handleSaveInitialBalance = async () => {
    const balance = parseFloat(tempInitialBalance);
    if (isNaN(balance) || balance <= 0) {
      showNotification("Saldo awal harus berupa angka positif!", "error");
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      await updateUser({
        variables: {
          id: userData.id,
          initialBalance: balance,
        },
      });
      setInitialBalance(balance);
      setShowInitialBalanceModal(false);
      setTempInitialBalance("");
      showNotification("Saldo awal berhasil disimpan!", "success");
    } catch (error) {
      showNotification("Gagal menyimpan saldo awal: " + error.message, "error");
    }
  };

  // Fungsi Validasi
  const validateName = (name) => {
    if (!name || name.trim() === "") {
      return "Nama tidak boleh kosong!";
    }
    if (name.length > 30) {
      return "Nama maksimal 30 karakter!";
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return "Nama hanya boleh berisi huruf!";
    }
    return null;
  };

  const validatePhone = (phone) => {
    if (phone && phone.trim() !== "") {
      if (!/^[0-9]+$/.test(phone)) {
        return "Nomor HP hanya boleh berisi angka!";
      }
      if (phone.length > 12) {
        return "Nomor HP maksimal 12 digit!";
      }
    }
    return null;
  };

  const validatePassword = (password, isNew = false) => {
    // Jika password masih sensor dan tidak diubah, skip validasi
    if (password === "****************" && !isNew) {
      return null;
    }

    if (password.length < 6) {
      return "Password minimal 6 karakter!";
    }
    if (password.length > 10) {
      return "Password maksimal 10 karakter!";
    }
    if (!/[a-zA-Z]/.test(password)) {
      return "Password harus mengandung huruf!";
    }
    if (!/[0-9]/.test(password)) {
      return "Password harus mengandung angka!";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password harus mengandung karakter khusus (!@#$%^&* dll)!";
    }
    return null;
  };

  const handleSaveProfile = async () => {
    // Cek apakah ada perubahan
    const isPasswordChanged = userProfile.password !== "****************";
    const isNameChanged = userProfile.name !== originalData.name;
    const isPhoneChanged = userProfile.phone !== originalData.phone;
    const isInitialBalanceChanged =
      initialBalance !== (data?.user?.initialBalance || 0);

    // Jika tidak ada perubahan sama sekali
    if (
      !isNameChanged &&
      !isPhoneChanged &&
      !isPasswordChanged &&
      !isInitialBalanceChanged
    ) {
      showNotification("Tidak ada perubahan yang disimpan.", "info");
      setIsEditProfile(false);
      return;
    }

    // Validasi Nama
    const nameError = validateName(userProfile.name);
    if (nameError) {
      showNotification(nameError, "error");
      return;
    }

    // Validasi Phone
    const phoneError = validatePhone(userProfile.phone);
    if (phoneError) {
      showNotification(phoneError, "error");
      return;
    }

    // Validasi Password (hanya jika diubah)
    if (isPasswordChanged) {
      const passwordError = validatePassword(userProfile.password, true);
      if (passwordError) {
        showNotification(passwordError, "error");
        return;
      }
    }

    // Ambil user ID dari localStorage
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const userId = userData.id;

    if (!userId) {
      showNotification(
        "Gagal mendapatkan data user. Silakan login ulang.",
        "error",
      );
      return;
    }

    // Tentukan password yang akan disimpan
    // Jika password masih **************** artinya tidak diubah, gunakan password asli
    const passwordToSave =
      userProfile.password === "****************"
        ? originalPassword
        : userProfile.password;

    try {
      await updateUser({
        variables: {
          id: parseInt(userId),
          name: userProfile.name,
          phone: userProfile.phone,
          password: passwordToSave,
          initialBalance: initialBalance,
        },
      });
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  // --- HANDLING LOADING & ERROR ---
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "light" ? "bg-gray-50" : "bg-slate-950"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={theme === "light" ? "text-gray-600" : "text-slate-400"}>
            Memuat data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "light" ? "bg-gray-50" : "bg-slate-950"
        }`}
      >
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error.message}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-4 md:p-6 font-sans relative transition-colors duration-300 ${
        theme === "light"
          ? "bg-gray-50 text-gray-900"
          : "bg-slate-950 text-slate-100"
      }`}
    >
      {/* --- HEADER --- */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1
            className={`text-2xl font-bold ${
              theme === "light" ? "text-gray-900" : "text-white"
            }`}
          >
            Dashboard User
          </h1>
          <p
            className={`text-sm ${
              theme === "light" ? "text-gray-600" : "text-slate-400"
            }`}
          >
            Selamat datang,{" "}
            <span className="font-bold text-blue-500">{userProfile.name}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
              theme === "light"
                ? "bg-gray-200 hover:bg-gray-300 border border-gray-300 text-gray-700"
                : "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white"
            }`}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            onClick={() => {
              setShowProfileModal(true);
              setShowPassword(false);
              setIsEditProfile(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              theme === "light"
                ? "bg-gray-200 hover:bg-gray-300 border border-gray-300 text-gray-700"
                : "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white"
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
          {/* 1. Card Grafik Saldo */}
          <div
            className={`rounded-xl p-6 shadow-xl relative ${
              theme === "light"
                ? "bg-white border border-gray-200"
                : "bg-slate-900 border border-slate-800"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3
                className={`text-lg font-semibold ${
                  theme === "light" ? "text-gray-700" : "text-slate-300"
                }`}
              >
                Grafik Saldo
              </h3>

              {/* Saldo REAL DARI DATABASE */}
              <div
                className={`flex items-center gap-3 px-5 py-2 rounded-full border transition-colors shadow-lg ${
                  isNegative
                    ? "bg-red-500/10 border-red-500/20 shadow-red-900/10"
                    : "bg-green-500/10 border-green-500/20 shadow-green-900/10"
                }`}
              >
                <span className="relative flex h-3 w-3">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isNegative ? "bg-red-400" : "bg-green-400"
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${
                      isNegative ? "bg-red-500" : "bg-green-500"
                    }`}
                  ></span>
                </span>

                <span
                  className={`text-xl font-bold font-mono tracking-wide ${
                    isNegative ? "text-red-400" : "text-green-400"
                  }`}
                >
                  $
                  {currentBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="colorBalance"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={isNegative ? "#ef4444" : "#3b82f6"}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={isNegative ? "#ef4444" : "#3b82f6"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme === "light" ? "#e5e7eb" : "#1e293b"}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    stroke={theme === "light" ? "#6b7280" : "#64748b"}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={theme === "light" ? "#6b7280" : "#64748b"}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={["dataMin - 50", "dataMax + 50"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === "light" ? "#fff" : "#0f172a",
                      borderColor: theme === "light" ? "#e5e7eb" : "#1e293b",
                      color: theme === "light" ? "#000" : "#fff",
                    }}
                    itemStyle={{ color: isNegative ? "#ef4444" : "#3b82f6" }}
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

          {/* 2. Statistik & Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] gap-4 items-stretch">
            <div
              className={`p-4 rounded-xl flex items-center gap-4 ${
                theme === "light"
                  ? "bg-white border border-gray-200"
                  : "bg-slate-900 border border-slate-800"
              }`}
            >
              <div className="bg-green-500/10 p-3 rounded-lg">
                <TrendingUp className="text-green-500" size={24} />
              </div>
              <div>
                <p
                  className={`text-xs ${
                    theme === "light" ? "text-gray-600" : "text-slate-400"
                  }`}
                >
                  Profit {getFilterLabel()}
                </p>
                <p className="text-xl font-bold text-green-400">
                  +$
                  {totalProfitInPeriod.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl flex items-center gap-4 ${
                theme === "light"
                  ? "bg-white border border-gray-200"
                  : "bg-slate-900 border border-slate-800"
              }`}
            >
              <div className="bg-red-500/10 p-3 rounded-lg">
                <TrendingDown className="text-red-500" size={24} />
              </div>
              <div>
                <p
                  className={`text-xs ${
                    theme === "light" ? "text-gray-600" : "text-slate-400"
                  }`}
                >
                  Rugi {getFilterLabel()}
                </p>
                <p className="text-xl font-bold text-red-400">
                  $
                  {totalLossInPeriod.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {/* PnL CARD dengan Toggle */}
            <button
              onClick={() => setShowPnLAsPercentage(!showPnLAsPercentage)}
              className={`p-6 rounded-xl transition-all hover:scale-105 cursor-pointer border-2 ${
                isPnLPositive
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-xs tracking-wide font-semibold ${
                      isPnLPositive ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    PnL{" "}
                    {filterDay || filterMonth || filterYear
                      ? "(Filtered)"
                      : "(All Time)"}
                  </p>
                  <span className="flex items-center gap-2">
                    <span
                      className={`animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-75 ${
                        isPnLPositive ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-3 w-3 ${
                        isPnLPositive ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                  </span>
                </div>

                <span
                  className={`text-xl font-bold font-mono tracking-wide ${
                    isPnLPositive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {showPnLAsPercentage ? (
                    <>
                      {isPnLPositive ? "+" : ""}
                      {pnlPercentage.toFixed(2)}%
                    </>
                  ) : (
                    <>
                      ${isPnLPositive ? "+" : ""}
                      {displayPnL.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </>
                  )}
                </span>
              </div>
            </button>

            {/* FILTER BUTTON - Icon Only */}
            <button
              onClick={() => setShowFilter(true)}
              className={`p-4 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                theme === "light"
                  ? "bg-gray-200 hover:bg-gray-300 border border-gray-300"
                  : "bg-slate-800 hover:bg-slate-700 border border-slate-700"
              }`}
              title="Filter Waktu"
            >
              <Filter size={24} className="text-blue-400" />
            </button>
          </div>

          {/* 3. Tabel History (Tetap Sama) */}
          <div
            className={`rounded-xl overflow-hidden ${
              theme === "light"
                ? "bg-white border border-gray-200"
                : "bg-slate-900 border border-slate-800"
            }`}
          >
            <div
              className={`px-6 py-4 flex justify-between items-center ${
                theme === "light"
                  ? "border-b border-gray-200"
                  : "border-b border-slate-800"
              }`}
            >
              <h3
                className={`font-semibold ${
                  theme === "light" ? "text-gray-700" : "text-slate-300"
                }`}
              >
                Riwayat Transaksi
              </h3>
              <span
                className={`text-xs ${
                  theme === "light" ? "text-gray-500" : "text-slate-500"
                }`}
              >
                {filteredHistory.length !== historyData.length
                  ? `Tampil: ${filteredHistory.length} dari ${historyData.length} Data`
                  : `Total: ${historyData.length} Data`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead
                  className={
                    theme === "light"
                      ? "bg-gray-50 text-gray-600"
                      : "bg-slate-950 text-slate-400"
                  }
                >
                  <tr>
                    <th className="px-6 py-3">Ticket</th>
                    <th className="px-6 py-3">Waktu</th>
                    <th className="px-6 py-3">Pair</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3 text-center">Lots</th>
                    <th className="px-6 py-3 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody
                  className={
                    theme === "light"
                      ? "divide-y divide-gray-200"
                      : "divide-y divide-slate-800"
                  }
                >
                  {currentItems.map((tx, index) => (
                    <tr
                      key={tx.id}
                      className={
                        theme === "light"
                          ? "hover:bg-gray-50"
                          : "hover:bg-slate-800/50"
                      }
                    >
                      <td
                        className={`px-6 py-3 font-mono text-xs ${
                          theme === "light" ? "text-gray-600" : "text-slate-400"
                        }`}
                      >
                        #{tx.ticket}
                      </td>
                      <td
                        className={`px-6 py-3 text-xs ${
                          theme === "light" ? "text-gray-600" : "text-slate-400"
                        }`}
                      >
                        {new Date(parseInt(tx.createdAt)).toLocaleString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </td>
                      <td className="px-6 py-3 font-medium">{tx.symbol}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${tx.type === "BUY" ? "bg-blue-500/10 text-blue-400" : "bg-orange-500/10 text-orange-400"}`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-3 text-center font-semibold ${
                          theme === "light" ? "text-gray-700" : "text-slate-300"
                        }`}
                      >
                        {parseFloat(tx.lots).toFixed(2)}
                      </td>
                      <td
                        className={`px-6 py-3 text-right font-bold ${parseFloat(tx.profit) >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        ${parseFloat(tx.profit) >= 0 ? "+" : ""}
                        {parseFloat(tx.profit).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className={`px-6 py-4 flex justify-between items-center ${
                theme === "light"
                  ? "border-t border-gray-200 bg-gray-50"
                  : "border-t border-slate-800 bg-slate-950"
              }`}
            >
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-lg border transition-all
                        ${
                          currentPage === 1
                            ? theme === "light"
                              ? "bg-transparent border-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-transparent border-slate-800 text-slate-600 cursor-not-allowed"
                            : theme === "light"
                              ? "bg-gray-200 border-gray-300 text-gray-900 hover:bg-gray-300"
                              : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                        }
                    `}
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span
                className={`text-xs ${
                  theme === "light" ? "text-gray-600" : "text-slate-500"
                }`}
              >
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-lg border transition-all
                        ${
                          currentPage === totalPages
                            ? theme === "light"
                              ? "bg-transparent border-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-transparent border-slate-800 text-slate-600 cursor-not-allowed"
                            : theme === "light"
                              ? "bg-gray-200 border-gray-300 text-gray-900 hover:bg-gray-300"
                              : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                        }
                    `}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL PROFIL (Koneksi Data Asli) --- */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in px-4">
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
              theme === "light"
                ? "bg-white border border-gray-200"
                : "bg-slate-900 border border-slate-700"
            }`}
          >
            <div
              className={`px-6 py-4 flex justify-between items-center ${
                theme === "light"
                  ? "bg-gray-100 border-b border-gray-200"
                  : "bg-slate-800 border-b border-slate-700"
              }`}
            >
              <h3
                className={`text-lg font-bold ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                Profil Akun
              </h3>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setIsEditProfile(false);
                  setShowPassword(false);
                }}
                className={
                  theme === "light"
                    ? "text-gray-600 hover:text-gray-900"
                    : "text-slate-400 hover:text-white"
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label
                  className={`block text-xs font-medium uppercase mb-1 ${
                    theme === "light" ? "text-gray-600" : "text-slate-500"
                  }`}
                >
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  disabled={!isEditProfile}
                  value={userProfile.name}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, name: e.target.value })
                  }
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none ${
                    theme === "light"
                      ? `bg-gray-50 ${isEditProfile ? "border-blue-500" : "border-gray-300"} text-gray-900`
                      : `bg-slate-950 ${isEditProfile ? "border-blue-500" : "border-slate-800"} text-white`
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-medium uppercase mb-1 ${
                    theme === "light" ? "text-gray-600" : "text-slate-500"
                  }`}
                >
                  No. Handphone
                </label>
                <input
                  type="text"
                  disabled={!isEditProfile}
                  value={userProfile.phone}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, phone: e.target.value })
                  }
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none ${
                    theme === "light"
                      ? `bg-gray-50 ${isEditProfile ? "border-blue-500" : "border-gray-300"} text-gray-900`
                      : `bg-slate-950 ${isEditProfile ? "border-blue-500" : "border-slate-800"} text-white`
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-medium uppercase mb-1 ${
                    theme === "light" ? "text-gray-600" : "text-slate-500"
                  }`}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    disabled={!isEditProfile}
                    value={userProfile.password}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        password: e.target.value,
                      })
                    }
                    className={`w-full border rounded-lg px-4 py-3 pr-10 focus:outline-none ${
                      theme === "light"
                        ? `bg-gray-50 ${isEditProfile ? "border-blue-500" : "border-gray-300"} text-gray-900`
                        : `bg-slate-950 ${isEditProfile ? "border-blue-500" : "border-slate-800"} text-white`
                    }`}
                  />
                  {isEditProfile && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 ${
                        theme === "light"
                          ? "text-gray-400 hover:text-gray-600"
                          : "text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label
                  className={`block text-xs font-medium uppercase mb-1 ${
                    theme === "light" ? "text-gray-600" : "text-slate-500"
                  }`}
                >
                  Magic Number (Permanent)
                </label>
                <input
                  type="text"
                  disabled={true}
                  value={userProfile.magicNumber}
                  className={`w-full border rounded-lg px-4 py-3 cursor-not-allowed ${
                    theme === "light"
                      ? "bg-gray-50 border-gray-300 text-gray-900"
                      : "bg-slate-950 border-slate-800 text-white"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-medium uppercase mb-1 ${
                    theme === "light" ? "text-gray-600" : "text-slate-500"
                  }`}
                >
                  Saldo Awal (Initial Balance)
                </label>
                <input
                  type="text"
                  disabled={!isEditProfile}
                  value={initialBalance}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      setInitialBalance(value);
                    }
                  }}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none ${
                    theme === "light"
                      ? `bg-gray-50 ${isEditProfile ? "border-blue-500" : "border-gray-300"} text-gray-900`
                      : `bg-slate-950 ${isEditProfile ? "border-blue-500" : "border-slate-800"} text-white`
                  }`}
                />
              </div>

              <div className="pt-4 flex gap-3">
                {!isEditProfile ? (
                  <button
                    onClick={() => setIsEditProfile(true)}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Profil
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsEditProfile(false);
                        setShowPassword(false);
                        // Reset password ke sensor jika dibatalkan
                        setUserProfile({
                          ...userProfile,
                          password: "****************",
                        });
                      }}
                      className={`flex-1 font-bold py-3 rounded-lg transition-colors ${
                        theme === "light"
                          ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                          : "bg-slate-800 text-white hover:bg-slate-700"
                      }`}
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveProfile}
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

      {/* --- MODAL SALDO AWAL (First Time) --- */}
      {showInitialBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in px-4">
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
              theme === "light"
                ? "bg-white border border-gray-200"
                : "bg-slate-900 border border-slate-700"
            }`}
          >
            <div
              className={`px-6 py-4 ${
                theme === "light"
                  ? "bg-gray-100 border-b border-gray-200"
                  : "bg-slate-800 border-b border-slate-700"
              }`}
            >
              <h3
                className={`text-lg font-bold ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                Set Saldo Awal
              </h3>
              <p
                className={`text-sm mt-1 ${
                  theme === "light" ? "text-gray-600" : "text-slate-400"
                }`}
              >
                Masukkan saldo awal akun Anda untuk perhitungan PnL
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === "light" ? "text-gray-700" : "text-slate-300"
                  }`}
                >
                  Saldo Awal (USD)
                </label>
                <input
                  type="number"
                  value={tempInitialBalance}
                  onChange={(e) => setTempInitialBalance(e.target.value)}
                  placeholder="Contoh: 1000"
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "light"
                      ? "bg-white border-gray-300 text-gray-900"
                      : "bg-slate-950 border-slate-700 text-white"
                  }`}
                />
              </div>

              <button
                onClick={handleSaveInitialBalance}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Simpan Saldo Awal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL FILTER WAKTU --- */}
      {showFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border ${
              theme === "light"
                ? "bg-white border-gray-200"
                : "bg-slate-900 border-slate-700"
            }`}
          >
            {/* Header */}
            <div
              className={`px-6 py-4 flex justify-between items-center border-b ${
                theme === "light"
                  ? "bg-gray-100 border-gray-200"
                  : "bg-slate-800 border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-blue-400" />
                <h3
                  className={`text-lg font-bold ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  Filter Waktu
                </h3>
              </div>
              <button
                onClick={() => setShowFilter(false)}
                className={
                  theme === "light"
                    ? "text-gray-600 hover:text-gray-900"
                    : "text-slate-400 hover:text-white"
                }
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Mode Tabs */}
            <div
              className={`flex border-b ${
                theme === "light" ? "border-gray-200" : "border-slate-800"
              }`}
            >
              <button
                onClick={() => setFilterMode("day")}
                className={`flex-1 py-3 text-sm font-semibold transition-all ${
                  filterMode === "day"
                    ? "bg-blue-600 text-white"
                    : theme === "light"
                      ? "text-gray-600 hover:bg-gray-100"
                      : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                Hari
              </button>
              <button
                onClick={() => setFilterMode("month")}
                className={`flex-1 py-3 text-sm font-semibold transition-all ${
                  filterMode === "month"
                    ? "bg-blue-600 text-white"
                    : theme === "light"
                      ? "text-gray-600 hover:bg-gray-100"
                      : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                Bulan
              </button>
              <button
                onClick={() => setFilterMode("year")}
                className={`flex-1 py-3 text-sm font-semibold transition-all ${
                  filterMode === "year"
                    ? "bg-blue-600 text-white"
                    : theme === "light"
                      ? "text-gray-600 hover:bg-gray-100"
                      : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                Tahun
              </button>
            </div>

            {/* Filter Inputs */}
            <div className="p-6 space-y-4">
              {filterMode === "day" && (
                <>
                  <div>
                    <label
                      className={`text-xs font-semibold mb-2 block uppercase ${
                        theme === "light" ? "text-gray-600" : "text-slate-400"
                      }`}
                    >
                      Tanggal
                    </label>
                    <select
                      value={filterDay}
                      onChange={(e) => setFilterDay(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-blue-500 transition-colors ${
                        theme === "light"
                          ? "bg-gray-50 border-gray-300 text-gray-900"
                          : "bg-slate-800 border-slate-700 text-slate-200"
                      }`}
                    >
                      <option value="">Pilih Tanggal</option>
                      {[...Array(31)].map((_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className={`text-xs font-semibold mb-2 block uppercase ${
                        theme === "light" ? "text-gray-600" : "text-slate-400"
                      }`}
                    >
                      Bulan
                    </label>
                    <select
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-blue-500 transition-colors ${
                        theme === "light"
                          ? "bg-gray-50 border-gray-300 text-gray-900"
                          : "bg-slate-800 border-slate-700 text-slate-200"
                      }`}
                    >
                      <option value="">Pilih Bulan</option>
                      {[
                        "Januari",
                        "Februari",
                        "Maret",
                        "April",
                        "Mei",
                        "Juni",
                        "Juli",
                        "Agustus",
                        "September",
                        "Oktober",
                        "November",
                        "Desember",
                      ].map((month, i) => (
                        <option key={i} value={i + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className={`text-xs font-semibold mb-2 block uppercase ${
                        theme === "light" ? "text-gray-600" : "text-slate-400"
                      }`}
                    >
                      Tahun
                    </label>
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-blue-500 transition-colors ${
                        theme === "light"
                          ? "bg-gray-50 border-gray-300 text-gray-900"
                          : "bg-slate-800 border-slate-700 text-slate-200"
                      }`}
                    >
                      <option value="">Pilih Tahun</option>
                      {[2023, 2024, 2025, 2026].map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {filterMode === "month" && (
                <>
                  <div>
                    <label
                      className={`text-xs font-semibold mb-2 block uppercase ${
                        theme === "light" ? "text-gray-600" : "text-slate-400"
                      }`}
                    >
                      Bulan
                    </label>
                    <select
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-blue-500 transition-colors ${
                        theme === "light"
                          ? "bg-gray-50 border-gray-300 text-gray-900"
                          : "bg-slate-800 border-slate-700 text-slate-200"
                      }`}
                    >
                      <option value="">Pilih Bulan</option>
                      {[
                        "Januari",
                        "Februari",
                        "Maret",
                        "April",
                        "Mei",
                        "Juni",
                        "Juli",
                        "Agustus",
                        "September",
                        "Oktober",
                        "November",
                        "Desember",
                      ].map((month, i) => (
                        <option key={i} value={i + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className={`text-xs font-semibold mb-2 block uppercase ${
                        theme === "light" ? "text-gray-600" : "text-slate-400"
                      }`}
                    >
                      Tahun
                    </label>
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-blue-500 transition-colors ${
                        theme === "light"
                          ? "bg-gray-50 border-gray-300 text-gray-900"
                          : "bg-slate-800 border-slate-700 text-slate-200"
                      }`}
                    >
                      <option value="">Pilih Tahun</option>
                      {[2023, 2024, 2025, 2026].map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {filterMode === "year" && (
                <div>
                  <label
                    className={`text-xs font-semibold mb-2 block uppercase ${
                      theme === "light" ? "text-gray-600" : "text-slate-400"
                    }`}
                  >
                    Tahun
                  </label>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-blue-500 transition-colors ${
                      theme === "light"
                        ? "bg-gray-50 border-gray-300 text-gray-900"
                        : "bg-slate-800 border-slate-700 text-slate-200"
                    }`}
                  >
                    <option value="">Pilih Tahun</option>
                    {[2023, 2024, 2025, 2026].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setFilterDay("");
                    setFilterMonth("");
                    setFilterYear("");
                  }}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
                    theme === "light"
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                  }`}
                >
                  Reset Filter
                </button>
                <button
                  onClick={() => setShowFilter(false)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`rounded-lg shadow-2xl p-4 border-l-4 backdrop-blur-sm animate-slide-in ${
              theme === "light"
                ? notif.type === "success"
                  ? "bg-white border-green-500"
                  : notif.type === "error"
                    ? "bg-white border-red-500"
                    : "bg-white border-blue-500"
                : notif.type === "success"
                  ? "bg-slate-800/90 border-green-500"
                  : notif.type === "error"
                    ? "bg-slate-800/90 border-red-500"
                    : "bg-slate-800/90 border-blue-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex-shrink-0 w-2 h-2 rounded-full ${
                  notif.type === "success"
                    ? "bg-green-500"
                    : notif.type === "error"
                      ? "bg-red-500"
                      : "bg-blue-500"
                }`}
              ></div>
              <p
                className={`text-sm font-medium ${
                  theme === "light" ? "text-gray-800" : "text-white"
                }`}
              >
                {notif.message}
              </p>
              <button
                onClick={() =>
                  setNotifications((prev) =>
                    prev.filter((n) => n.id !== notif.id),
                  )
                }
                className={`ml-auto flex-shrink-0 ${
                  theme === "light"
                    ? "text-gray-400 hover:text-gray-600"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
