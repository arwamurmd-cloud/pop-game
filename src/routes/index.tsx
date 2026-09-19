import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Leaf, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Just One Question — A Game for My Sister" },
      { name: "description", content: "A charming little game with one impossible challenge." },
      { property: "og:title", content: "Just One Question — A Game for My Sister" },
      { property: "og:description", content: "A charming little game with one impossible challenge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Cormorant+Garamond:wght@500;600&family=Manrope:wght@400;500;600&display=swap" },
    ],
  }),
  component: SisterGame,
});

type Scene = "question" | "celebration" | "challenge" | "game" | "ending";
type BalloonColor = "sage" | "blue" | "cream" | "peach" | "rose";
type BalloonData = { id: number; x: number; y: number; color: BalloonColor; drift: number };
type Burst = { id: number; x: number; y: number; color: BalloonColor };

const colorClasses: Record<BalloonColor, string> = {
  sage: "bg-sage text-sage",
  blue: "bg-blue-soft text-blue-soft",
  cream: "bg-cream-deep text-cream-deep",
  peach: "bg-peach text-peach",
  rose: "bg-rose text-rose",
};

const initialBalloons: BalloonData[] = [
  { id: 1, x: 14, y: 23, color: "sage", drift: 5.1 },
  { id: 2, x: 34, y: 48, color: "blue", drift: 5.8 },
  { id: 3, x: 52, y: 19, color: "cream", drift: 4.8 },
  { id: 4, x: 69, y: 51, color: "peach", drift: 5.5 },
  { id: 5, x: 84, y: 27, color: "rose", drift: 5.9 },
];

const heartPositions = [
  [-72, -28], [-42, -68], [3, -82], [49, -56], [76, -13], [-64, 44], [58, 48], [4, 72],
];

function SisterGame() {
  const [scene, setScene] = useState<Scene>("question");
  const [noPosition, setNoPosition] = useState({ x: 92, y: 0 });
  const [challengeLine, setChallengeLine] = useState(false);
  const [score, setScore] = useState(0);
  const [balloons, setBalloons] = useState(initialBalloons);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const noRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(6);

  useEffect(() => {
    if (scene !== "challenge") return;
    const timer = window.setTimeout(() => setChallengeLine(true), 650);
    return () => window.clearTimeout(timer);
  }, [scene]);

  const dodge = useCallback(() => {
    const margin = 110;
    const maxX = Math.max(margin, window.innerWidth / 2 - margin);
    const maxY = Math.max(80, window.innerHeight / 2 - 120);
    setNoPosition({
      x: (Math.random() * 2 - 1) * maxX,
      y: (Math.random() * 2 - 1) * maxY,
    });
  }, []);

  const watchCursor = (event: React.PointerEvent<HTMLElement>) => {
    if (scene !== "question" || !noRef.current) return;
    const rect = noRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    if (Math.hypot(event.clientX - centerX, event.clientY - centerY) < 125) dodge();
  };

  const sayYes = () => {
    setScene("celebration");
    window.setTimeout(() => setScene("challenge"), 1900);
  };

  const startGame = () => {
    setScore(0);
    setBalloons(initialBalloons);
    setBursts([]);
    setScene("game");
  };

  const popBalloon = (balloon: BalloonData) => {
    const burstId = nextId.current++;
    setScore((value) => value + 1);
    setBursts((current) => [...current, { id: burstId, x: balloon.x, y: balloon.y, color: balloon.color }]);
    window.setTimeout(() => setBursts((current) => current.filter((burst) => burst.id !== burstId)), 650);

    const colors = Object.keys(colorClasses) as BalloonColor[];
    const makeBalloon = (direction: number): BalloonData => ({
      id: nextId.current++,
      x: Math.min(91, Math.max(6, balloon.x + direction * (7 + Math.random() * 6))),
      y: Math.min(72, Math.max(15, balloon.y + (Math.random() * 18 - 9))),
      color: colors[Math.floor(Math.random() * colors.length)],
      drift: 4.5 + Math.random() * 2,
    });
    setBalloons((current) => [
      ...current.filter((item) => item.id !== balloon.id),
      makeBalloon(-1),
      makeBalloon(1),
    ]);
  };

  const restart = () => {
    setScore(0);
    setChallengeLine(false);
    setBalloons(initialBalloons);
    setNoPosition({ x: 92, y: 0 });
    setScene("question");
  };

  return (
    <main className="paper-grain relative h-screen min-h-[680px] min-w-[960px] overflow-hidden bg-background text-foreground" onPointerMove={watchCursor}>
      <AmbientDetails />
      <AnimatePresence mode="wait">
        {scene === "question" && (
          <motion.section key="question" className="absolute inset-0 flex items-center justify-center" exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.45 }}>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="relative w-[510px] rounded-lg border border-border bg-card px-16 py-16 text-center shadow-paper">
              <span className="mb-6 inline-flex size-10 items-center justify-center rounded-full bg-sage-soft text-primary"><Heart size={17} strokeWidth={1.7} /></span>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">A very important question</p>
              <h1 className="font-display text-5xl font-semibold leading-none">Do you love me?</h1>
              <div className="mt-11 flex items-center justify-center gap-5">
                <Button variant="love" size="experience" onClick={sayYes}>Yes</Button>
                <div className="h-12 w-28" />
              </div>
            </motion.div>
            <motion.div ref={noRef} className="absolute left-1/2 top-[59%]" animate={{ x: noPosition.x, y: noPosition.y }} transition={{ type: "spring", stiffness: 110, damping: 18, mass: 0.8 }}>
              <Button variant="paper" size="experience" tabIndex={-1} onFocus={dodge} onPointerDown={(event) => { event.preventDefault(); dodge(); }} aria-label="No — if you can catch it">No</Button>
            </motion.div>
          </motion.section>
        )}

        {scene === "celebration" && (
          <motion.section key="celebration" className="absolute inset-0 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: "blur(8px)" }}>
            <motion.div className="absolute size-72 rounded-full bg-sage-soft/50 blur-3xl" initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: 1.4, opacity: [0, 0.8, 0] }} transition={{ duration: 1.7 }} />
            {heartPositions.map(([x, y], index) => (
              <motion.div key={index} className="absolute text-rose" initial={{ x: 0, y: 10, scale: 0, opacity: 0 }} animate={{ x, y, scale: [0, 1, 0.8], opacity: [0, 1, 0] }} transition={{ duration: 1.4, delay: index * 0.06, ease: "easeOut" }}><Heart size={13 + (index % 3) * 3} fill="currentColor" /></motion.div>
            ))}
            {Array.from({ length: 18 }).map((_, index) => {
              const angle = (Math.PI * 2 * index) / 18;
              const radius = 95 + (index % 4) * 16;
              return <motion.span key={index} className={`absolute size-1.5 rounded-full ${index % 3 === 0 ? "bg-peach" : index % 3 === 1 ? "bg-sage" : "bg-blue-soft"}`} initial={{ x: 0, y: 0, scale: 0 }} animate={{ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, scale: [0, 1, 0], opacity: [0, 1, 0] }} transition={{ duration: 1.1, delay: 0.1 + index * 0.015 }} />;
            })}
            <motion.div className="relative text-center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: 0.3 }}>
              <p className="font-hand text-7xl font-semibold text-primary">I knew it.</p>
              <p className="mt-3 text-xs tracking-[0.2em] text-muted-foreground">Obviously.</p>
            </motion.div>
          </motion.section>
        )}

        {scene === "challenge" && (
          <motion.section key="challenge" className="absolute inset-0 flex items-center justify-center text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -15 }}>
            <div className="max-w-2xl">
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-display text-7xl font-semibold">Great.</motion.p>
              <AnimatePresence>
                {challengeLine && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <p className="mt-7 text-lg text-muted-foreground">Now win this game to get rid of me.</p>
                    <Button variant="love" size="experience" className="mt-10" onClick={startGame}>Start</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        )}

        {scene === "game" && (
          <motion.section key="game" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <header className="absolute inset-x-0 top-0 z-40 flex h-28 items-center justify-between border-b border-border/70 bg-background/85 px-12 backdrop-blur-md">
              <div>
                <p className="font-display text-3xl font-semibold">Pop 5 balloons to get rid of me.</p>
                <p className="mt-1 text-xs text-muted-foreground">This should be easy.</p>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 text-center">
                <motion.p key={score} initial={{ scale: 1.2, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-4xl font-semibold tabular-nums">{score} / 5</motion.p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">popped</p>
              </div>
              <Button variant="quiet" size="sm" onClick={() => setScene("ending")}><X size={15} /> Quit</Button>
            </header>
            <div className="absolute inset-x-0 bottom-0 top-28">
              <AnimatePresence>
                {balloons.map((balloon) => (
                  <motion.button key={balloon.id} type="button" aria-label={`Pop ${balloon.color} balloon`} className={`balloon absolute ${colorClasses[balloon.color]}`} style={{ left: `${balloon.x}%`, top: `${balloon.y}%` }} initial={{ scale: 0, opacity: 0 }} animate={{ y: [0, -13, 0, 9, 0], rotate: [0, 1.5, 0, -1.5, 0], scale: 1, opacity: 1 }} exit={{ scale: [1, 1.18, 0], opacity: [1, 1, 0] }} transition={{ y: { duration: balloon.drift, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: balloon.drift, repeat: Infinity }, scale: { duration: 0.28 }, opacity: { duration: 0.24 } }} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }} onClick={() => popBalloon(balloon)} />
                ))}
              </AnimatePresence>
              {bursts.map((burst) => (
                <div key={burst.id} className="pointer-events-none absolute" style={{ left: `${burst.x}%`, top: `${burst.y}%` }}>
                  {Array.from({ length: 10 }).map((_, index) => {
                    const angle = (Math.PI * 2 * index) / 10;
                    return <motion.span key={index} className={`absolute size-2 rounded-full ${colorClasses[burst.color].split(" ")[0]}`} initial={{ x: 35, y: 45, scale: 1 }} animate={{ x: 35 + Math.cos(angle) * 70, y: 45 + Math.sin(angle) * 70, scale: 0, opacity: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} />;
                  })}
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {scene === "ending" && (
          <motion.section key="ending" className="absolute inset-0 flex items-center justify-center text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <div>
              <motion.p className="font-hand text-7xl font-semibold" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>Hahaha...</motion.p>
              <motion.p className="mt-5 font-display text-4xl text-muted-foreground" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.65 }}>Seems like you can never get rid of me.</motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }}>
                <Button variant="paper" size="experience" className="mt-12" onClick={restart}><RotateCcw size={15} /> Restart</Button>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      <div className="absolute bottom-7 left-1/2 z-50 -translate-x-1/2 text-[9px] font-semibold uppercase tracking-[0.28em] text-muted-foreground/60">made with affection &amp; poor intentions</div>
    </main>
  );
}

function AmbientDetails() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-8 top-20 rotate-12 text-sage/45"><Leaf size={120} strokeWidth={0.7} /></div>
      <div className="absolute -right-4 bottom-14 -rotate-12 text-rose/30"><Leaf size={100} strokeWidth={0.7} /></div>
      <div className="absolute left-10 top-10 size-2 rounded-full bg-peach/50" />
      <div className="absolute bottom-16 right-24 size-1.5 rounded-full bg-sage/60" />
    </div>
  );
}