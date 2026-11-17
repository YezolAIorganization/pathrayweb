import { useEffect, useRef } from 'react';

type Coord = [number, number];
type Point = { lat: number; lon: number; r: number };

const RAD = Math.PI / 180;
const TILT = 20 * RAD;

// Decorative points only (lat, lon). Move to market config later.
const ARCS: [Coord, Coord][] = [
  [[33.7, 73.1], [52.5, 13.4]],
  [[33.7, 73.1], [37.6, 127]],
  [[33.7, 73.1], [51.5, -0.1]],
  [[33.7, 73.1], [41.9, 12.5]],
  [[33.7, 73.1], [43.7, -79.4]],
  [[52.5, 13.4], [43.7, -79.4]],
  [[35.7, 139.7], [-33.9, 151.2]],
];

function toVec(c: Coord): [number, number, number] {
  const la = c[0] * RAD;
  const lo = c[1] * RAD;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

function arcPoints(a: Coord, b: Coord, steps = 48): Point[] {
  const va = toVec(a);
  const vb = toVec(b);
  const dot = Math.min(1, Math.max(-1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
  const omega = Math.acos(dot);
  const s = Math.sin(omega);
  const out: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const k1 = s ? Math.sin((1 - t) * omega) / s : 1 - t;
    const k2 = s ? Math.sin(t * omega) / s : t;
    const x = k1 * va[0] + k2 * vb[0];
    const y = k1 * va[1] + k2 * vb[1];
    const z = k1 * va[2] + k2 * vb[2];
    out.push({
      lat: Math.asin(y) / RAD,
      lon: Math.atan2(x, z) / RAD,
      r: 1 + 0.16 * Math.sin(Math.PI * t),
    });
  }
  return out;
}

const ARC_LINES = ARCS.map(([a, b]) => arcPoints(a, b));
const DOTS: Coord[] = ARCS.flatMap(([a, b]) => [a, b]);

function project(lat: number, lon: number, rot: number, r: number) {
  const la = lat * RAD;
  const lo = (lon - rot) * RAD;
  const x = Math.cos(la) * Math.sin(lo);
  const y = Math.sin(la);
  const z = Math.cos(la) * Math.cos(lo);
  const y2 = y * Math.cos(TILT) - z * Math.sin(TILT);
  const z2 = y * Math.sin(TILT) + z * Math.cos(TILT);
  return { x: x * r, y: y2 * r, z: z2 };
}

function draw(ctx: CanvasRenderingContext2D, size: number, rot: number) {
  const c = size / 2;
  const R = size * 0.42;
  ctx.clearRect(0, 0, size, size);

  const g = ctx.createRadialGradient(c - R * 0.35, c - R * 0.35, R * 0.1, c, c, R);
  g.addColorStop(0, '#2B4A8C');
  g.addColorStop(0.55, '#1B2F5E');
  g.addColorStop(1, '#131F3F');
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();

  const line = (pts: Point[]) => {
    let open = false;
    ctx.beginPath();
    for (const p of pts) {
      const q = project(p.lat, p.lon, rot, p.r);
      if (q.z > 0) {
        const X = c + q.x * R;
        const Y = c - q.y * R;
        if (!open) {
          ctx.moveTo(X, Y);
          open = true;
        } else {
          ctx.lineTo(X, Y);
        }
      } else {
        open = false;
      }
    }
    ctx.stroke();
  };

  // Graticule
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 1;
  for (let lon = 0; lon < 360; lon += 30) {
    const pts: Point[] = [];
    for (let lat = -90; lat <= 90; lat += 6) pts.push({ lat, lon, r: 1 });
    line(pts);
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts: Point[] = [];
    for (let lon = 0; lon <= 360; lon += 6) pts.push({ lat, lon, r: 1 });
    line(pts);
  }

  // Route arcs
  ctx.strokeStyle = 'rgba(34,211,238,0.85)';
  ctx.lineWidth = 1.25;
  for (const arc of ARC_LINES) line(arc);

  // City dots
  ctx.fillStyle = '#22D3EE';
  for (const d of DOTS) {
    const q = project(d[0], d[1], rot, 1);
    if (q.z > 0) {
      ctx.beginPath();
      ctx.arc(c + q.x * R, c - q.y * R, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Rim
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.stroke();
}

function isLite() {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    nav.connection?.saveData === true ||
    ['slow-2g', '2g'].includes(nav.connection?.effectiveType ?? '') ||
    (nav.deviceMemory ?? 8) <= 2 ||
    (navigator.hardwareConcurrency ?? 8) <= 2
  );
}

export default function Globe() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lite = isLite();
    let size = 0;
    let rot = 40;
    let raf = 0;
    let last = 0;
    let visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = Math.round(canvas.getBoundingClientRect().width);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, size, rot);
    };

    const tick = (now: number) => {
      if (last) rot = (rot + ((now - last) / 1000) * 6) % 360; // 6 deg/s = 60 s per turn
      last = now;
      draw(ctx, size, rot);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (lite || raf || !visible || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="block aspect-square w-full" />;
}