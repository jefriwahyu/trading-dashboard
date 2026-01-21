import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, Trash2, Edit, User, AlertTriangle, X, Sun, Moon } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // --- STATE THEME ---
  const [theme, setTheme] = useState('light'); // default: light

  // --- STATE DATA USER (Mock Data) ---
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", phone: "08123456789", magicNumber: "37483" },
    { id: 2, name: "Jane Smith", phone: "08987654321", magicNumber: "99281" },
    { id: 3, name: "Budi Santoso", phone: "08567891234", magicNumber: "11029" },
    { id: 4, name: "Siti Aminah", phone: "08129988776", magicNumber: "55432" },
  ]);

  // --- STATE MODAL ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showModal, setShowModal] = useState(false); // Satu modal untuk Add & Edit
  const [deleteId, setDeleteId] = useState(null);

  // --- STATE FORM & EDIT ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    magicNumber: "",
  });

  // Fungsi Logout
  const handleLogout = () => {
    navigate("/");
  };

  // --- LOGIKA HAPUS ---
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const executeDelete = () => {
    setUsers(users.filter((user) => user.id !== deleteId));
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  // --- LOGIKA BUKA MODAL ---
  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ name: "", phone: "", password: "", magicNumber: "" });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setIsEditMode(true);
    setEditId(user.id);
    // Isi form dengan data user yang dipilih
    setFormData({
      name: user.name,
      phone: user.phone,
      password: "", // Password dikosongkan (opsional mau diganti atau tidak)
      magicNumber: user.magicNumber,
    });
    setShowModal(true);
  };

  // --- LOGIKA SIMPAN (ADD & EDIT) ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.magicNumber) {
      alert("Nama dan Magic Number wajib diisi!");
      return;
    }

    if (isEditMode) {
      // --- LOGIKA UPDATE ---
      const updatedUsers = users.map((user) => {
        if (user.id === editId) {
          return { ...user, ...formData };
        }
        return user;
      });
      setUsers(updatedUsers);
    } else {
      // --- LOGIKA CREATE ---
      const newUser = {
        id: users.length + 1 + Math.random(), // Random ID biar gak duplikat
        ...formData,
      };
      setUsers([...users, newUser]);
    }

    // Reset & Tutup
    setShowModal(false);
    setFormData({ name: "", phone: "", password: "", magicNumber: "" });
  };

  return (
    <div className={`min-h-screen p-6 font-sans relative transition-colors duration-300 ${
      theme === 'light'
        ? 'bg-gray-50 text-gray-900'
        : 'bg-slate-950 text-slate-100'
    }`}>
      
      {/* --- HEADER --- */}
      <div className={`max-w-5xl mx-auto flex justify-between items-center mb-10 p-4 rounded-xl shadow-lg ${
        theme === 'light'
          ? 'bg-white border border-gray-200'
          : 'bg-slate-900 border border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <User size={24} className="text-white" />
          </div>
          <h1 className={`text-2xl font-bold ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>Admin Dashboard</h1>
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
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
        </div>
      </div>

      {/* --- CONTENT UTAMA --- */}
      <div className="max-w-5xl mx-auto">
        
        {/* Tombol Tambah User */}
        <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-semibold ${
              theme === 'light' ? 'text-gray-700' : 'text-slate-400'
            }`}>Daftar Pengguna</h2>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-lg hover:shadow-blue-600/20 transition-all active:scale-95"
            >
              <Plus size={20} />
              <span>Tambah User</span>
            </button>
        </div>

        {/* --- TABEL USER --- */}
        <div className={`rounded-xl overflow-hidden shadow-2xl ${
          theme === 'light'
            ? 'bg-white border border-gray-200'
            : 'bg-slate-900 border border-slate-800'
        }`}>
          <table className="w-full text-left">
            <thead className={`uppercase text-xs tracking-wider ${
              theme === 'light'
                ? 'bg-gray-50 text-gray-600'
                : 'bg-slate-950 text-slate-400'
            }`}>
              <tr>
                <th className="px-6 py-4 font-semibold">Nama</th>
                <th className="px-6 py-4 font-semibold">No. Hp</th>
                <th className="px-6 py-4 font-semibold">Magic Number</th>
                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className={theme === 'light' ? 'divide-y divide-gray-200' : 'divide-y divide-slate-800'}>
              {users.map((user) => (
                <tr key={user.id} className={theme === 'light' ? 'hover:bg-gray-50 transition-colors' : 'hover:bg-slate-800/50 transition-colors'}>
                  <td className={`px-6 py-4 font-medium ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>{user.name}</td>
                  <td className={`px-6 py-4 ${
                    theme === 'light' ? 'text-gray-700' : 'text-slate-300'
                  }`}>{user.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`text-blue-400 px-3 py-1 rounded-full text-sm font-mono border ${
                      theme === 'light'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-slate-800 border-slate-700'
                    }`}>
                      {user.magicNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      {/* Tombol Edit */}
                      <button 
                        onClick={() => openEditModal(user)}
                        className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-black transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      {/* Tombol Hapus */}
                      <button 
                        onClick={() => confirmDelete(user.id)}
                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={`px-6 py-4 flex justify-between items-center ${
            theme === 'light'
              ? 'bg-gray-50 border-t border-gray-200'
              : 'bg-slate-950 border-t border-slate-800'
          }`}>
             <button className={theme === 'light' ? 'text-gray-600 hover:text-gray-900 text-sm' : 'text-slate-400 hover:text-white text-sm'}>Previous</button>
             <span className={`text-xs ${
               theme === 'light' ? 'text-gray-600' : 'text-slate-500'
             }`}>Page 1 of 1</span>
             <button className={theme === 'light' ? 'text-gray-600 hover:text-gray-900 text-sm' : 'text-slate-400 hover:text-white text-sm'}>Next</button>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: KONFIRMASI HAPUS --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`p-6 rounded-2xl shadow-2xl w-full max-w-sm ${
            theme === 'light'
              ? 'bg-white border border-gray-200'
              : 'bg-slate-900 border border-slate-700'
          }`}>
            <div className="flex justify-center mb-4">
              <div className="bg-red-500/10 p-3 rounded-full">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
            </div>
            <h3 className={`text-xl font-bold text-center mb-2 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>Hapus Data?</h3>
            <p className={`text-center text-sm mb-6 ${
              theme === 'light' ? 'text-gray-600' : 'text-slate-400'
            }`}>Data yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={cancelDelete} className={`px-6 py-2 rounded-lg transition-colors border ${
                theme === 'light'
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-900 border-gray-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
              }`}>Tidak</button>
              <button onClick={executeDelete} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: FORM INPUT (ADD / EDIT) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in px-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
            theme === 'light'
              ? 'bg-white border border-gray-200'
              : 'bg-slate-900 border border-slate-700'
          }`}>
            
            {/* Modal Header */}
            <div className={`px-6 py-4 flex justify-between items-center ${
              theme === 'light'
                ? 'bg-gray-100 border-b border-gray-200'
                : 'bg-slate-800 border-b border-slate-700'
            }`}>
              <h3 className={`text-lg font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {isEditMode ? "Edit User" : "Tambah User"}
              </h3>
              <button onClick={() => setShowModal(false)} className={theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-slate-400 hover:text-white'}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'light' ? 'text-gray-700' : 'text-slate-400'
                }`}>Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none ${
                    theme === 'light'
                      ? 'bg-gray-50 border-gray-300 text-gray-900'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'light' ? 'text-gray-700' : 'text-slate-400'
                }`}>No. Handphone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none ${
                    theme === 'light'
                      ? 'bg-gray-50 border-gray-300 text-gray-900'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                  placeholder="0812..."
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'light' ? 'text-gray-700' : 'text-slate-400'
                }`}>
                  {isEditMode ? "Password Baru (Opsional)" : "Password"}
                </label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none ${
                    theme === 'light'
                      ? 'bg-gray-50 border-gray-300 text-gray-900'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                  placeholder={isEditMode ? "Kosongkan jika tidak diubah" : "Secret123"}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'light' ? 'text-gray-700' : 'text-slate-400'
                }`}>Magic Number</label>
                <input
                  type="text"
                  name="magicNumber"
                  value={formData.magicNumber}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none ${
                    theme === 'light'
                      ? 'bg-gray-50 border-gray-300 text-gray-900'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                  placeholder="38472"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all"
                >
                  {isEditMode ? "Simpan Perubahan" : "Tambah User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;