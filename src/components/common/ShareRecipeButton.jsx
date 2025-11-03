// src/components/common/ShareRecipeButton.jsx
import { useState } from 'react';
import { Share2, Link2, Facebook, Twitter, MessageCircle, Mail, Check, X } from 'lucide-react';
import LazyImage from './LazyImage';

export default function ShareRecipeButton({ recipe, size = 'md', variant = 'button' }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Generate share URL
  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?recipe=${recipe.id}`;
  };

  // Generate share text
  const getShareText = () => {
    return `Cek resep "${recipe.name}" yang enak ini! ${getShareUrl()}`;
  };

  // Copy to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Gagal menyalin link');
    }
  };

  // Share via Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.name,
          text: `Cek resep ${recipe.name} yang enak ini!`,
          url: getShareUrl()
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      setShowShareModal(true);
    }
  };

  // Share to Facebook
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  // Share to Twitter
  const shareToTwitter = () => {
    const text = encodeURIComponent(getShareText());
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  // Share to WhatsApp
  const shareToWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  // Share via Email
  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Resep: ${recipe.name}`);
    const body = encodeURIComponent(`Hai! Saya ingin berbagi resep yang menarik:\n\n${recipe.name}\n\n${getShareUrl()}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <>
      {/* Share Button */}
      <button
        onClick={handleNativeShare}
        className={`
          ${sizes[size]} rounded-full flex items-center justify-center gap-1.5
          transition-all duration-200
          bg-white/90 hover:bg-white text-slate-700 hover:text-blue-500
          backdrop-blur-sm shadow-md hover:shadow-lg
          group
        `}
        title="Bagikan resep"
      >
        <Share2 className={`${iconSizes[size]} transition-transform group-hover:scale-110`} />
      </button>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Bagikan Resep</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Recipe Preview */}
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex gap-4">
                  <LazyImage
                    src={recipe.image_url}
                    alt={recipe.name}
                    className="w-20 h-20 rounded-lg overflow-hidden"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 mb-1">{recipe.name}</h4>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {recipe.description || 'Resep lezat dari Resep Nusantara'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Copy Link */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Link Resep
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={getShareUrl()}
                    readOnly
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      copied
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Link2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {copied && (
                  <p className="text-sm text-green-600 mt-2">✓ Link berhasil disalin!</p>
                )}
              </div>

              {/* Share Options */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Bagikan via
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* WhatsApp */}
                  <button
                    onClick={shareToWhatsApp}
                    className="flex items-center justify-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors border border-green-200"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">WhatsApp</span>
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={shareToFacebook}
                    className="flex items-center justify-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors border border-blue-200"
                  >
                    <Facebook className="w-5 h-5" />
                    <span className="font-medium">Facebook</span>
                  </button>

                  {/* Twitter */}
                  <button
                    onClick={shareToTwitter}
                    className="flex items-center justify-center gap-3 px-4 py-3 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl transition-colors border border-sky-200"
                  >
                    <Twitter className="w-5 h-5" />
                    <span className="font-medium">Twitter</span>
                  </button>

                  {/* Email */}
                  <button
                    onClick={shareViaEmail}
                    className="flex items-center justify-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors border border-slate-200"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}