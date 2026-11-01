import React, { useState } from 'react';
import { useTapeStore } from '../../stores/useTapeStore';
import { X, Copy, Check, RefreshCw, Globe, Lock, ExternalLink, Share2 } from 'lucide-react';

export const ShareModal: React.FC = () => {
  const {
    isShareModalOpen,
    setShareModalOpen,
    collection,
    updateCollection,
    setVisitorMode,
  } = useTapeStore();

  const [copied, setCopied] = useState(false);

  if (!isShareModalOpen) return null;

  const shareUrl = `${window.location.origin}/c/${collection.share_token}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateToken = () => {
    const newToken = 'tape-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
    updateCollection({ share_token: newToken });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md crystal-modal rounded-3xl overflow-hidden flex flex-col border border-white/60 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3a2f26]/10 flex items-center justify-between bg-white/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3a2f26] to-[#6d5543] flex items-center justify-center shadow-xs text-white">
              <Share2 className="w-4 h-4 text-[#d8a25e]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#2b221a] tracking-tight">
                Share Collection
              </h2>
              <p className="text-xs text-[#7e6d5d]">
                Allow others to explore and listen in 3D
              </p>
            </div>
          </div>
          <button
            onClick={() => setShareModalOpen(false)}
            className="p-1.5 rounded-full text-[#7e6d5d] hover:text-[#2b221a] hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Public / Private toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center text-[#242420]">
                {collection.is_public ? <Globe className="w-4 h-4 text-[#3a2f26]" /> : <Lock className="w-4 h-4 text-[#7e6d5d]" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#242420]">
                  {collection.is_public ? 'Public Link Sharing Active' : 'Collection is Private'}
                </p>
                <p className="text-[11px] text-[#7e6d5d]">
                  {collection.is_public
                    ? 'Anyone with the link can explore and listen'
                    : 'Only you can view and play this collection'}
                </p>
              </div>
            </div>

            <button
              onClick={() => updateCollection({ is_public: !collection.is_public })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                collection.is_public ? 'bg-[#3a2f26]' : 'bg-[#ded8ce]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                  collection.is_public ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Share Link input */}
          {collection.is_public && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3a2f26]">
                Unique Collection Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 neuro-well px-3 py-2 rounded-xl text-xs text-[#5a4d3f] select-all font-mono"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#3a2f26] text-white hover:bg-[#251e18] shadow-xs active:scale-95 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleRegenerateToken}
                  className="flex items-center gap-1 text-[11px] text-[#7e6d5d] hover:text-[#3a2f26] transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate link token</span>
                </button>

                <button
                  onClick={() => {
                    setVisitorMode(true);
                    setShareModalOpen(false);
                  }}
                  className="flex items-center gap-1 text-[11px] text-[#7e6d5d] hover:text-[#3a2f26] transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Preview as Visitor</span>
                </button>
              </div>
            </div>
          )}

          {/* Permissions explanation */}
          <div className="p-3 bg-white/40 rounded-xl border border-white/60 text-[11px] text-[#7e6d5d] space-y-1 shadow-xs">
            <p className="font-semibold text-[#242420]">Visitor Experience:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[#7e6d5d]">
              <li>Visitors can freely browse 3D carousel and spatial arrangements</li>
              <li>Visitors can play, pause, and seek through tracks</li>
              <li>Visitors can open and read journals in the 3D book reader</li>
              <li>Visitors cannot edit or delete tapes and journals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
