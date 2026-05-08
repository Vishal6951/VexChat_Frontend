import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * LandingPage — full-screen hero with particle canvas, glowing title, and CTA.
 */
export default function LandingPage() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // ── Particle system ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    const PARTICLE_COUNT = 80;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${p.opacity})`;
        ctx.fill();
      }

      // Draw connecting lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124, 58, 237, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-void-950 flex flex-col overflow-hidden">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Radial purple glow behind title */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-purple-600 shadow-[0_0_10px_rgba(124,58,237,0.8)]" />
          <span className="font-bold text-gray-200 tracking-tight">VexChat</span>
        </div>
        {/* Nav hidden on mobile to prevent overflow */}
        <nav className="hidden sm:flex gap-6 text-sm text-gray-500">
          <a href="#about" className="hover:text-gray-300 transition-colors">About</a>
          <a href="#report" className="hover:text-gray-300 transition-colors">Report</a>
          <a href="#terms" className="hover:text-gray-300 transition-colors">Terms</a>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center animate-fade-in">
        {/* Void logo mark */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-purple-600/20 blur-2xl scale-150" />
          <div className="relative w-20 h-20 rounded-full bg-purple-950 border border-purple-600/30 flex items-center justify-center orb-pulse">
            <div className="w-8 h-8 rounded-full bg-purple-600/40 blur-sm" />
            <div className="absolute w-6 h-6 rounded-full bg-purple-400/30" />
          </div>
        </div>

        {/* Title — scales from 5xl on xs to 8xl on lg */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter mb-4 purple-glow-text animate-glow">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-purple-300 via-purple-400 to-purple-600">
            VexChat
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl text-gray-500 mb-12 max-w-md leading-relaxed animate-slide-up">
          Connect with a stranger.{' '}
          <span className="text-gray-400">Disappear after.</span>
        </p>

        {/* CTA — full width on xs, auto on sm+ */}
        <button
          onClick={() => navigate('/chat')}
          className="
            group relative w-full sm:w-auto px-10 py-4 rounded-2xl text-base font-semibold
            bg-purple-600 text-white
            hover:bg-purple-500 transition-all duration-300
            shadow-[0_0_30px_rgba(124,58,237,0.4)]
            hover:shadow-[0_0_50px_rgba(124,58,237,0.7)]
            hover:scale-105 active:scale-95
            animate-slide-up
          "
        >
          <span className="relative z-10">Enter the Void</span>
          {/* Shine sweep on hover */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </button>

        {/* Disclaimer */}
        <p className="mt-8 text-xs text-gray-700 max-w-xs">
          By entering, you agree to our Terms of Service. Stay respectful.
        </p>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 py-6 text-center">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-700">
          <a href="#about" className="hover:text-gray-500 transition-colors">About</a>
          <span className="text-gray-800">·</span>
          <a href="#report" className="hover:text-gray-500 transition-colors">Report</a>
          <span className="text-gray-800">·</span>
          <a href="#terms" className="hover:text-gray-500 transition-colors">Terms</a>
          <span className="text-gray-800">·</span>
          <span className="text-gray-800">© 2025 VexChat</span>
        </div>
      </footer>
    </div>
  );
}
