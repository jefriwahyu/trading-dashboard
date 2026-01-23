import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, Trash2, Edit, User, AlertTriangle, X, Sun, Moon, Loader2, Lock } from "lucide-react";
import { useQuery, useMutation, gql } from '@apollo/client';

// --- QUERIES & MUTATIONS ---
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      phone
      magicNumber
      password
      role
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($name: String!, $phone: String!, $magicNumber: String!, $password: String!, $role: Role) {
    createUser(name: $name, phone: $phone, magicNumber: $magicNumber, password: $password, role: $role) {
      id
      name
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: Int!, $name: String, $phone: String, $password: String, $role: Role) {
    updateUser(id: $id, name: $name, phone: $phone, password: $password, role: $role) {
      id
      name
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id) {
      id
    }
  }
`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('dark'); // Default dark mode agar keren

  // --- LOGIC DATABASE ---
  const { data, loading, refetch } = useQuery(GET_USERS);
  
  const [addUser] = useMutation(CREATE_USER, { 
    onCompleted: () => { refetch(); setShowModal(false); } 
  });
  
  const [editUser] = useMutation(UPDATE_USER, { 
    onCompleted: () => { refetch(); setShowModal(false); } 
  });

  const [removeUser] = useMutation(DELETE_USER, { 
    onCompleted: () => { refetch(); setShowDeleteModal(false); } 
  });

  // --- STATE UI ---
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    magicNumber: "",
    password: "",
    role: "USER"
  });

  // --- FUNCTIONS ---
  const generateMagicNumber = () => Math.floor(100000 + Math.random() * 900000).toString();

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ 
      name: "", 
      phone: "", 
      magicNumber: generateMagicNumber(), 
      password: "", 
      role: "USER" 
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setIsEditMode(true);
    setSelectedUserId(user.id);
    setFormData({
      name: user.name,
      phone: user.phone,
      magicNumber: user.magicNumber,
      password: user.password,
      role: user.role
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.password) return alert("Nama dan Password wajib diisi!");

    try {
      if (isEditMode) {
        await editUser({ 
          variables: { 
            id: parseInt(selectedUserId), 
            name: formData.name, 
            phone: formData.phone, 
            password: formData.password, 
            role: formData.role 
          } 
        });
      } else {
        await addUser({ variables: { ...formData } });
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const users = data?.users || [];

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-slate-950 text-slate-100'
    }`}>
      
      {/* HEADER */}
      <div className={`max-w-5xl mx-auto flex justify-between items-center mb-10 p-4 rounded-xl shadow-lg border ${
        theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg"><User size={24} className="text-white" /></div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 rounded-lg border border-slate-700">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={() => navigate("/")} className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg">
            <LogOut size={18} /><span>Keluar</span>
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold opacity-80">Database Pengguna</h2>
          <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg active:scale-95 transition-all">
            <Plus size={20} /><span>Tambah User</span>
          </button>
        </div>

        <div className={`rounded-xl overflow-hidden shadow-2xl border ${
          theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-800'
        }`}>
          {loading ? (
            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className={`uppercase text-xs font-bold ${theme === 'light' ? 'bg-gray-50 text-gray-600' : 'bg-slate-950 text-slate-400'}`}>
                <tr>
                  <th className="px-6 py-4 text-center">ID</th>
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Magic Number</th>
                  <th className="px-6 py-4">Password</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-6 py-4 text-center opacity-50">{user.id}</td>
                    <td className="px-6 py-4 font-bold">{user.name}</td>
                    <td className="px-6 py-4 font-mono text-blue-400">{user.magicNumber}</td>
                    <td className="px-6 py-4 opacity-70">{user.password}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-3">
                      <button onClick={() => openEditModal(user)} className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => { setDeleteId(user.id); setShowDeleteModal(true); }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL: ADD / EDIT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border ${
            theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-700'
          }`}>
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-700">
              <h3 className="text-lg font-bold">{isEditMode ? "Edit Pengguna" : "Tambah Pengguna Baru"}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase mb-1 block">Nama Lengkap</label>
                <input type="text" className={`w-full p-3 rounded-lg border bg-transparent focus:border-blue-500 focus:outline-none ${theme === 'light' ? 'border-gray-300' : 'border-slate-800'}`}
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Nama User" />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase mb-1 block">No Handphone</label>
                <input type="text" className={`w-full p-3 rounded-lg border bg-transparent focus:border-blue-500 focus:outline-none ${theme === 'light' ? 'border-gray-300' : 'border-slate-800'}`}
                  value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="08..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase mb-1 block">Magic Number</label>
                  <input type="text" readOnly className={`w-full p-3 rounded-lg border bg-slate-800/50 opacity-60 cursor-not-allowed ${theme === 'light' ? 'border-gray-300 text-gray-500' : 'border-slate-800 text-blue-400'}`}
                    value={formData.magicNumber} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase mb-1 block">Password</label>
                  <input type="text" className={`w-full p-3 rounded-lg border bg-transparent focus:border-blue-500 focus:outline-none ${theme === 'light' ? 'border-gray-300' : 'border-slate-800'}`}
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Min 6 Karakter" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase mb-1 block">Otoritas (Role)</label>
                <select className={`w-full p-3 rounded-lg border focus:border-blue-500 focus:outline-none ${theme === 'light' ? 'bg-white border-gray-300' : 'bg-slate-950 border-slate-800'}`}
                  value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="USER">USER (Trader)</option>
                  <option value="ADMIN">ADMIN (Manager)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                <Plus size={20} /> {isEditMode ? "Simpan Perubahan" : "Daftarkan ke PostgreSQL"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className={`p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-700'}`}>
            <AlertTriangle size={50} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Hapus Pengguna?</h3>
            <p className="text-slate-400 text-sm mb-6">Tindakan ini akan menghapus seluruh data user dan riwayat trade secara permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition-all">Batal</button>
              <button onClick={async () => { await removeUser({ variables: { id: parseInt(deleteId) } }); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;