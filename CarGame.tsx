import { useEffect, useRef, useState, useCallback } from 'react';
import { X as CloseIcon, RotateCcw, Trophy } from 'lucide-react';

const W = 320;
const H = 480;
const LANE_COUNT = 4;
const LANE_W = W / LANE_COUNT;
const CAR_W = 36;
const CAR_H = 60;
const OBS_W = 36;
const OBS_H = 60;

function getLaneCenterX(lane: number) {
  return lane * LANE_W + LANE_W / 2;
}

interface Obstacle {
  lane: number;
  y: number;
  color: string;
}

const OBS_COLORS = ['#ef4444', '#f97316', '#8b5cf6', '#06b6d4', '#10b981'];

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawCar(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  const x = cx - CAR_W / 2;
  const y = cy - CAR_H / 2;
  ctx.fillStyle = color;
  drawRoundedRect(ctx, x, y, CAR_W, CAR_H, 8);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x + 4, y + 6, CAR_W - 8, 14);
  ctx.fillRect(x + 4, y + CAR_H - 20, CAR_W - 8, 14);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 6, y + 8, 10, 10);
  ctx.fillRect(x + CAR_W - 16, y + 8, 10, 10);
}

function drawObs(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  const x = cx - OBS_W / 2;
  const y = cy - OBS_H / 2;
  ctx.fillStyle = color;
  drawRoundedRect(ctx, x, y, OBS_W, OBS_H, 8);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x + 4, y + 6, OBS_W - 8, 12);
  ctx.fillRect(x + 4, y + OBS_H - 18, OBS_W - 8, 12);
}

export default function CarGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    lane: 1,
    targetLane: 1,
    carX: getLaneCenterX(1),
    obstacles: [] as Obstacle[],
    score: 0,
    speed: 3,
    frameCount: 0,
    roadOffset: 0,
    alive: true,
    started: false,
    highScore: 0,
  });
  const animRef = useRef<number>(0);
  const [display, setDisplay] = useState({ score: 0, alive: true, started: false, highScore: 0 });

  const resetGame = useCallback(() => {
    const s = stateRef.current;
    s.lane = 1;
    s.targetLane = 1;
    s.carX = getLaneCenterX(1);
    s.obstacles = [];
    s.score = 0;
    s.speed = 3;
    s.frameCount = 0;
    s.roadOffset = 0;
    s.alive = true;
    s.started = true;
    setDisplay({ score: 0, alive: true, started: true, highScore: s.highScore });
  }, []);

  const moveLeft = useCallback(() => {
    const s = stateRef.current;
    if (!s.alive || !s.started) { resetGame(); return; }
    if (s.targetLane > 0) s.targetLane--;
  }, [resetGame]);

  const moveRight = useCallback(() => {
    const s = stateRef.current;
    if (!s.alive || !s.started) { resetGame(); return; }
    if (s.targetLane < LANE_COUNT - 1) s.targetLane++;
  }, [resetGame]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); moveLeft(); }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); moveRight(); }
      if ((e.key === ' ' || e.key === 'Enter') && !stateRef.current.started) { e.preventDefault(); resetGame(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [moveLeft, moveRight, resetGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartX = e.touches[0].clientX; };
    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) < 20) {
        const s = stateRef.current;
        if (!s.alive || !s.started) resetGame();
        return;
      }
      if (dx < 0) moveLeft(); else moveRight();
    };
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });

    const loop = () => {
      const s = stateRef.current;
      ctx.clearRect(0, 0, W, H);

      // Road background
      ctx.fillStyle = '#374151';
      ctx.fillRect(0, 0, W, H);

      // Lane lines
      s.roadOffset = (s.roadOffset + s.speed) % 60;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.setLineDash([30, 30]);
      for (let l = 1; l < LANE_COUNT; l++) {
        ctx.beginPath();
        ctx.moveTo(l * LANE_W, -60 + s.roadOffset);
        ctx.lineTo(l * LANE_W, H);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Road edges
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(W, H); ctx.stroke();

      if (!s.started) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Car Dodge', W / 2, H / 2 - 50);
        ctx.font = '15px sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('Tap or press any key to start', W / 2, H / 2 - 10);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('← → or A / D to steer', W / 2, H / 2 + 20);
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      if (s.alive) {
        s.frameCount++;
        s.score = Math.floor(s.frameCount / 6);
        s.speed = 3 + Math.floor(s.frameCount / 300) * 0.5;

        // Smooth car X movement
        const targetX = getLaneCenterX(s.targetLane);
        s.carX += (targetX - s.carX) * 0.18;

        // Spawn obstacles
        const spawnRate = Math.max(55, 90 - Math.floor(s.frameCount / 200) * 5);
        if (s.frameCount % spawnRate === 0) {
          const usedLanes = s.obstacles.filter(o => o.y < 80).map(o => o.lane);
          const available = [0, 1, 2, 3].filter(l => !usedLanes.includes(l));
          if (available.length > 0) {
            const lane = available[Math.floor(Math.random() * available.length)];
            s.obstacles.push({
              lane,
              y: -OBS_H / 2,
              color: OBS_COLORS[Math.floor(Math.random() * OBS_COLORS.length)],
            });
          }
        }

        // Move obstacles & collision
        s.obstacles = s.obstacles.filter(o => o.y < H + OBS_H);
        for (const obs of s.obstacles) {
          obs.y += s.speed;
          const cx = getLaneCenterX(obs.lane);
          const carY = H - 80;
          if (
            Math.abs(s.carX - cx) < (CAR_W + OBS_W) / 2 - 4 &&
            Math.abs(carY - obs.y) < (CAR_H + OBS_H) / 2 - 4
          ) {
            s.alive = false;
            if (s.score > s.highScore) s.highScore = s.score;
            setDisplay({ score: s.score, alive: false, started: true, highScore: s.highScore });
          }
        }

        setDisplay(d => ({ ...d, score: s.score }));
      }

      // Draw obstacles
      for (const obs of s.obstacles) {
        drawObs(ctx, getLaneCenterX(obs.lane), obs.y, obs.color);
      }

      // Draw player car
      drawCar(ctx, s.carX, H - 80, '#3b82f6');

      // HUD score
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      drawRoundedRect(ctx, 6, 6, 80, 30, 8);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${s.score}`, 14, 26);

      if (!s.alive) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CRASH!', W / 2, H / 2 - 55);
        ctx.fillStyle = '#fff';
        ctx.font = '18px sans-serif';
        ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 - 20);
        ctx.fillStyle = '#fbbf24';
        ctx.font = '15px sans-serif';
        ctx.fillText(`Best: ${s.highScore}`, W / 2, H / 2 + 10);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px sans-serif';
        ctx.fillText('Tap or press key to retry', W / 2, H / 2 + 50);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [moveLeft, moveRight, resetGame]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[100] bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center p-4 gap-3 max-w-sm w-full">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          aria-label="Close"
        >
          <CloseIcon size={20} />
        </button>

        <div className="flex items-center justify-between w-full px-1">
          <h2 className="text-lg font-bold text-slate-800">Car Dodge</h2>
          <div className="flex items-center gap-1.5 text-amber-500">
            <Trophy size={16} />
            <span className="text-sm font-bold">{display.highScore}</span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="rounded-xl border border-slate-200 cursor-pointer"
          style={{ touchAction: 'none', maxWidth: '100%' }}
          onClick={() => {
            const s = stateRef.current;
            if (!s.started || !s.alive) resetGame();
          }}
        />

        <div className="flex gap-3 w-full">
          <button
            onClick={moveLeft}
            className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 text-xl font-bold hover:bg-slate-200 active:scale-95 transition-all select-none"
            aria-label="Move left"
          >
            ◀
          </button>
          <button
            onClick={() => {
              const s = stateRef.current;
              if (!s.started || !s.alive) resetGame();
            }}
            className="flex-1 py-3 rounded-xl bg-navy-700 text-white text-sm font-semibold hover:bg-navy-800 active:scale-95 transition-all select-none flex items-center justify-center gap-1.5"
            aria-label="Restart"
          >
            <RotateCcw size={14} />
            {display.started ? 'Retry' : 'Start'}
          </button>
          <button
            onClick={moveRight}
            className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 text-xl font-bold hover:bg-slate-200 active:scale-95 transition-all select-none"
            aria-label="Move right"
          >
            ▶
          </button>
        </div>

        <p className="text-[11px] text-slate-400">← → or A/D keys · Tap left/right to steer</p>
      </div>
    </div>
  );
}
