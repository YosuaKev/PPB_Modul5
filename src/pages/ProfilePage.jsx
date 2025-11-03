import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Heart, ChefHat, Settings, Camera, Save, X, BookOpen } from 'lucide-react';
import userService from '../services/userService';

export default function ProfilePage({ onRecipeClick }) {
  const [activeTab, setActiveTab] = useState('info');
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [myRecipes, setMyRecipes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: ''
  });

  // Load profile on mount
  useEffect(() => {
    loadProfile();
    loadFavorites();
    loadMyRecipes();
  }, []);

  const loadProfile = () => {
    const userProfile = userService.getUserProfile();
    setProfile(userProfile);
    setEditForm({
      username: userProfile.username || 'Pengguna',
      bio: userProfile.bio || ''
    });
  };

  const loadFavorites = () => {
    try {
      const favoritesData = JSON.parse(localStorage.getItem('favorites') || '[]');
      // Get recipe details from localStorage or API
      const favoriteRecipes = favoritesData.map(id => {
        // Here you would fetch from API, for now using mock data
        return {
          id: id,
          name: `Resep ${id}`,
          image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
          category: 'makanan',
          difficulty: 'mudah',
          prep_time: 30
        };
      });
      setFavorites(favoriteRecipes);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadMyRecipes = () => {
    // Mock data - in real app, fetch from API
    setMyRecipes([]);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      username: profile.username || 'Pengguna',
      bio: profile.bio || ''
    });
  };

  const handleSaveProfile = () => {
    const result = userService.saveUserProfile({
      username: editForm.username,
      bio: editForm.bio,
      avatar: profile.avatar
    });

    if (result.success) {
      setProfile(result.data);
      setIsEditing(false);
      alert('Profil berhasil diperbarui!');
    } else {
      alert('Gagal memperbarui profil');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = userService.updateAvatar(reader.result);
      if (result.success) {
        setProfile(result.data);
        alert('Avatar berhasil diperbarui!');
      }
    };
    reader.readAsDataURL(file);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-white/40 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-2xl font-bold"
                    placeholder="Nama Anda"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="Ceritakan tentang diri Anda..."
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    {profile.username}
                  </h1>
                  {profile.bio && (
                    <p className="text-slate-600 mb-4">{profile.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Bergabung sejak 2025</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4" />
                      <span>{myRecipes.length} Resep</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      <span>{favorites.length} Favorit</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Simpan
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Batal
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Edit Profil
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'info'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User className="w-5 h-5 inline mr-2" />
              Informasi
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Favorit ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'recipes'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-5 h-5 inline mr-2" />
              Resep Saya ({myRecipes.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Info Tab */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/70 p-6 rounded-xl border border-white/60">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">User ID</p>
                        <p className="font-semibold text-slate-800">{profile.userId}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/70 p-6 rounded-xl border border-white/60">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <ChefHat className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Total Resep</p>
                        <p className="font-semibold text-slate-800">{myRecipes.length} resep</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/70 p-6 rounded-xl border border-white/60">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Favorit</p>
                        <p className="font-semibold text-slate-800">{favorites.length} resep</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/70 p-6 rounded-xl border border-white/60">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Terakhir Update</p>
                        <p className="font-semibold text-slate-800">
                          {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('id-ID') : 'Belum ada'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div>
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">Belum ada resep favorit</p>
                    <p className="text-slate-400 text-sm mt-2">
                      Mulai tambahkan resep favorit dengan menekan tombol hati
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((recipe) => (
                      <div
                        key={recipe.id}
                        onClick={() => onRecipeClick && onRecipeClick(recipe.id, recipe.category)}
                        className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                      >
                        <div className="relative h-48">
                          <img
                            src={recipe.image_url}
                            alt={recipe.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3">
                            <Heart className="w-6 h-6 text-red-500 fill-current" />
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                            {recipe.name}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-slate-600">
                            <span className="capitalize">{recipe.category}</span>
                            <span>{recipe.prep_time} menit</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Recipes Tab */}
            {activeTab === 'recipes' && (
              <div>
                {myRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">Belum ada resep yang dibuat</p>
                    <p className="text-slate-400 text-sm mt-2">
                      Mulai buat resep pertamamu sekarang!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myRecipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        onClick={() => onRecipeClick && onRecipeClick(recipe.id)}
                        className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer"
                      >
                        <div className="relative h-48">
                          <img
                            src={recipe.image_url}
                            alt={recipe.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-slate-800 mb-2">{recipe.name}</h3>
                          <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>{recipe.category}</span>
                            <span>{recipe.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}