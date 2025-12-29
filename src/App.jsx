import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Globe, ExternalLink, Copy, Check, Loader2, Layout, ArrowRight, AlertCircle, X, Maximize2, LogOut } from 'lucide-react';

// --- UTILS ---
const copyToClipboard = (text) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

// --- COMPONENTS ---

// 1. PREVIEW MODAL COMPONENT
const PreviewModal = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-3xl transition-all duration-500"
        onClick={onClose}
      />

      {/* Popup Container */}
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-[#111]/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-md z-10">
          <h3 className="font-bold text-white text-base md:text-lg truncate pr-4">{data.name}</h3>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-0 scrollbar-hide">
          <div className="relative w-full aspect-video bg-black/50">
             <img 
               src={`https://image.thum.io/get/width/1200/crop/800/noanimate/${data.url}`} 
               alt="Preview" 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent opacity-60" />
          </div>

          <div className="p-5 md:p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-widest">About Project</label>
              <p className="text-white/80 leading-relaxed text-sm">
                 {data.description || "A high-performance web application deployed on Vercel."}
              </p>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-widest">Tech Stack</label>
               <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 md:px-3 md:py-1 rounded-full bg-white/10 border border-white/5 text-[10px] md:text-xs text-emerald-300 font-mono">
                    {data.framework || 'React'}
                  </span>
                  <span className="px-2 py-1 md:px-3 md:py-1 rounded-full bg-white/10 border border-white/5 text-[10px] md:text-xs text-blue-300 font-mono">
                    Vercel
                  </span>
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 pt-2 border-t border-white/5 bg-[#111]">
          <a 
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 md:py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-transform active:scale-95 shadow-lg shadow-white/5 text-sm md:text-base"
          >
            Open Full Site <Maximize2 size={16} />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};


const Card = ({ data, active, onSwipe, onLongPress, index, total }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);

  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [exitX, setExitX] = useState(0); // Control explicit exit animation

  // Gesture State
  const timerRef = useRef(null);
  const isLongPressRef = useRef(false);

  // --- GESTURE LOGIC ---
  const handlePointerDown = () => {
    if (!active) return;
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress(data);
    }, 500);
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleDragStart = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsDragging(true);
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (!isLongPressRef.current) {
      if (offset > 100 || velocity > 800) {
        setExitX(1000); // Fly right
        onSwipe('right');
      } else if (offset < -100 || velocity < -800) {
        setExitX(-1000); // Fly left
        onSwipe('left');
      }
    }
    isLongPressRef.current = false;
  };

  const screenshotUrl = `https://image.thum.io/get/width/600/crop/800/noanimate/${data.url}`;

  const handleCopy = (e) => {
    e.stopPropagation();
    copyToClipboard(data.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      style={{ 
        x: active ? x : 0, 
        rotate: active ? rotate : 0, 
        opacity: active ? opacity : 0.6,
        zIndex: active ? 10 : 0,
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: active ? (isDragging ? 'grabbing' : 'grab') : 'default',
        touchAction: 'none'
      }}
      drag={active && exitX === 0 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      
      animate={active 
        ? (exitX !== 0 
            ? { x: exitX, opacity: 0, scale: 1 } // Exit animation
            : { x: 0, scale: 1, y: 0, opacity: 1 } // Normal state (snap back)
          )
        : { scale: 0.92, y: 40, opacity: 0.5, x: 0 } // Background state
      }
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="w-full h-full flex items-center justify-center select-none"
    >
      {/* UPDATED CARD DIMENSIONS:
        - w-[85vw]: Slightly narrower than full screen on mobile.
        - max-w-[320px]: Ensures it doesn't get huge on phablets.
        - aspect-[3/5]: Taller aspect ratio for mobile to fit content.
        - max-h-[65vh]: Prevents it from hitting browser bars.
      */}
      <div className="relative w-[85vw] max-w-[320px] md:max-w-[380px] aspect-[3/5] md:aspect-[3/4] max-h-[65vh] md:max-h-[700px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col group transition-transform duration-300">
        
        {active && (
          <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 z-20 border-4 border-emerald-400 text-emerald-400 font-bold text-xl md:text-2xl px-4 py-1 rounded-lg transform -rotate-12 bg-black/20 backdrop-blur-sm pointer-events-none">
            VISIT
          </motion.div>
        )}

        {/* Card Header */}
        <div 
          className="h-[45%] md:h-1/2 w-full relative flex items-center justify-center overflow-hidden bg-black/50"
          style={{ backgroundColor: imageError ? `${data.dominantColor}40` : '#000' }}
        >
          {!imageLoaded && !imageError && (
             <div className="absolute inset-0 flex items-center justify-center z-10">
               <Loader2 className="animate-spin text-white/30" />
             </div>
          )}

          {!imageError ? (
            <img 
              src={screenshotUrl} 
              alt={data.name}
              draggable={false}
              className={`w-full h-full object-cover object-top transition-opacity duration-500 pointer-events-none ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <>
              <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-gradient-to-br from-white/20 to-transparent" />
              <Globe size={64} className="text-white/80 drop-shadow-lg" />
            </>
          )}
          
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] md:text-xs font-mono text-white/90 border border-white/10 uppercase tracking-wider z-20 shadow-lg">
            {data.framework || 'Vercel'}
          </div>
        </div>

        {/* Card Content - Compact padding for mobile */}
        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between bg-gradient-to-b from-[#0a0a0a] to-black">
          <div>
            <div className="flex items-center justify-between mb-1.5 md:mb-2">
              <span className="text-[10px] md:text-xs font-medium text-white/40 tracking-widest uppercase">Project {index + 1} / {total}</span>
            </div>
            {/* Smaller text sizes for mobile */}
            <h2 className="text-xl md:text-3xl font-bold text-white mb-2 leading-tight tracking-tight break-words">{data.name}</h2>
            <p className="text-xs md:text-sm text-white/60 line-clamp-3 leading-relaxed">
              {data.description || "Live Vercel Project. Tap and hold to preview details."}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2.5 md:p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group/url">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 flex-shrink-0">
                <Globe size={12} className="md:w-[14px] md:h-[14px]" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] md:text-xs text-white/40 mb-0.5">Public URL</p>
                <p className="text-xs md:text-sm text-white font-mono truncate">{data.url.replace('https://', '')}</p>
              </div>
              <button 
                onClick={handleCopy}
                className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors relative flex-shrink-0"
              >
                {copied ? <Check size={16} className="text-emerald-400"/> : <Copy size={16} />}
              </button>
            </div>

            <a 
              href={data.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-3 md:py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 active:scale-95 transition-all shadow-lg shadow-white/5 text-sm md:text-base"
            >
              Visit Website <ExternalLink size={16} className="md:w-[18px] md:h-[18px]" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Background = ({ color }) => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#050505]">
      <motion.div 
        animate={{ backgroundColor: color }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 opacity-40"
      />
      
      <motion.div 
        animate={{ 
          backgroundColor: color,
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] rounded-full blur-[100px] mix-blend-screen opacity-30"
      />
      
      <motion.div 
        animate={{ 
          backgroundColor: color,
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] rounded-full blur-[120px] mix-blend-screen opacity-20"
      />

      <div className="absolute inset-0 bg-black/20 backdrop-blur-[60px]" />
      
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
    </div>
  );
};

export default function App() {
  const [token, setToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);
  
  // Preview State
  const [previewProject, setPreviewProject] = useState(null);

  // --- LOCAL STORAGE LOGIC ---
  useEffect(() => {
    const savedToken = localStorage.getItem('vercel_token');
    if (savedToken) {
        setToken(savedToken);
        fetchVercelProjects(savedToken);
    }
  }, []);

  const clearToken = () => {
    localStorage.removeItem('vercel_token');
    setToken('');
    setProjects([]);
    setCurrentIndex(0);
  };

  const fetchVercelProjects = async (apiToken) => {
    setLoading(true);
    setError(null);
    try {
      const API = "https://api.vercel.com";
      
      const projectsRes = await fetch(`${API}/v9/projects`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      
      if (!projectsRes.ok) {
        if (projectsRes.status === 403 || projectsRes.status === 401) {
            localStorage.removeItem('vercel_token');
            throw new Error("Invalid Token or Unauthorized.");
        }
        throw new Error(`Failed to fetch projects (Status: ${projectsRes.status})`);
      }
      
      const projectsData = await projectsRes.json();
      const rawProjects = projectsData.projects || [];

      // Sort by updatedAt desc
      rawProjects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      const processed = await Promise.all(rawProjects.map(async (p) => {
        try {
          const domainsRes = await fetch(`${API}/v9/projects/${p.id}/domains`, {
            headers: { Authorization: `Bearer ${apiToken}` },
          });
          const domainsData = await domainsRes.json();
          const domains = domainsData.domains || [];

          let publicUrl;
          if (domains.length > 0) {
            publicUrl = `https://${domains[0].name}`;
          } else {
            publicUrl = `https://${p.name}.vercel.app`;
          }

          const hash = p.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const hue = hash % 360;
          const color = `hsl(${hue}, 70%, 50%)`;

          return {
            id: p.id,
            name: p.name,
            url: publicUrl,
            framework: p.framework,
            dominantColor: color,
            description: `Last updated: ${new Date(p.updatedAt).toLocaleDateString()}`
          };
        } catch (e) {
            return {
                id: p.id,
                name: p.name,
                url: `https://${p.name}.vercel.app`,
                framework: p.framework,
                dominantColor: '#444',
                description: 'Could not resolve custom domains.'
            }
        }
      }));

      setProjects(processed);
      setToken(apiToken);
      localStorage.setItem('vercel_token', apiToken);
    } catch (err) {
      console.error(err);
      setError(err.message === 'Failed to fetch' ? "Network Error: Ensure your Token is correct and Vercel API is accessible." : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSubmit = (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    fetchVercelProjects(tokenInput.trim());
  };

  const handleSwipe = (dir) => {
    if (dir === 'right') {
      const url = projects[currentIndex].url;
      window.open(url, '_blank');
    }

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % projects.length);
    }, 400);
  };

  const currentColor = projects[currentIndex]?.dominantColor || '#333';
  const nextIndex = (currentIndex + 1) % projects.length;

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden font-sans text-white selection:bg-white/20">
      
      <Background color={currentColor} />

      {/* Nav / Header */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 md:p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg">
            <Layout size={18} className="md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base md:text-lg leading-none tracking-tight">Vercel Deck</h1>
            <p className="text-[10px] md:text-xs text-white/50 font-medium tracking-widest uppercase mt-1">Client View</p>
          </div>
        </div>

        {token && (
            <button 
                onClick={clearToken}
                className="pointer-events-auto px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-[10px] md:text-xs font-mono flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-white/60 hover:text-white"
                title="Disconnect & Clear Token"
            >
                <LogOut size={14} />
                <span className="hidden sm:inline">DISCONNECT</span>
            </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
        
        {/* State: No Token - Show Input */}
        {!token && !loading && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-[90vw] max-w-md p-6 md:p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl mx-4 shadow-2xl"
            >
                <h2 className="text-xl md:text-2xl font-bold mb-2">Connect Vercel</h2>
                <p className="text-white/60 text-xs md:text-sm mb-6">Enter your Vercel Access Token to fetch your projects directly from your browser.</p>
                
                <form onSubmit={handleTokenSubmit} className="space-y-4">
                    <div className="relative">
                        <input 
                            type="password"
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            placeholder="Vercel Token (ey...)"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-mono text-sm"
                        />
                    </div>
                    
                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-200 text-sm">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-white text-black font-bold py-3 md:py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        Load Projects <ArrowRight size={18} />
                    </button>

                    <p className="text-[10px] text-white/30 text-center pt-2">
                        Token is saved locally for convenience.
                    </p>
                </form>
            </motion.div>
        )}

        {/* State: Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-white/50" size={32} />
            <p className="text-white/40 text-sm tracking-wider animate-pulse">FETCHING PROJECTS...</p>
          </div>
        )}

        {/* State: Projects Loaded - Render STACK */}
        {token && !loading && projects.length > 0 && (
          <div className="relative w-full h-full flex items-center justify-center perspective-1000">
            
            <motion.div 
               className="relative w-full h-full flex items-center justify-center"
               animate={{ scale: previewProject ? 0.92 : 1, filter: previewProject ? 'blur(4px)' : 'blur(0px)' }}
               transition={{ duration: 0.4 }}
            >
                {/* Back card */}
                {projects.length > 1 && (
                   <Card 
                      key={projects[nextIndex].id} 
                      data={projects[nextIndex]}
                      active={false}
                      index={nextIndex}
                      total={projects.length}
                   />
                )}

                {/* Front card */}
                <Card 
                  key={projects[currentIndex].id}
                  data={projects[currentIndex]}
                  active={true}
                  onSwipe={handleSwipe}
                  onLongPress={setPreviewProject} 
                  index={currentIndex}
                  total={projects.length}
                />
            </motion.div>

          </div>
        )}
        
        {/* State: No Projects Found */}
        {token && !loading && projects.length === 0 && (
             <div className="text-center p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
                 <p className="text-white/50 mb-4">No projects found for this token.</p>
                 <button onClick={clearToken} className="text-sm bg-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-colors">Try different token</button>
             </div>
        )}
      </div>

      {/* PREVIEW OVERLAY */}
      <AnimatePresence>
        {previewProject && (
          <PreviewModal 
            data={previewProject} 
            onClose={() => setPreviewProject(null)} 
          />
        )}
      </AnimatePresence>

      {/* Footer Controls */}
      {token && !loading && projects.length > 0 && !previewProject && (
        <div className="absolute bottom-6 md:bottom-8 left-0 right-0 z-40 flex flex-col items-center justify-center pointer-events-none">
          <div className="flex gap-2 mb-3 md:mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>
          <p className="text-[10px] md:text-xs text-white/30 uppercase tracking-[0.2em] font-medium text-center leading-relaxed">
            Swipe to Navigate <br/>
            Hold to Preview
          </p>
        </div>
      )}

    </div>
  );
}