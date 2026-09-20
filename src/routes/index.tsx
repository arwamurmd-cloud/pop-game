import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, RotateCcw, X } from "lucide-react";
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
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Fredoka:wght@500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Shantell+Sans:ital,wght@0,600;0,700;0,800;1,700&display=swap" },
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

const heartPositions: Array<[number, number]> = [
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
      color: colors[Math.floor(Math.random() * colors.length)] ?? "sage",
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
    <main className="scrapbook-gingham-bg paper-grain relative h-screen min-h-[680px] min-w-[960px] overflow-hidden text-foreground select-none" onPointerMove={watchCursor}>
      <ScreenBorderFrame isEnding={scene === "ending"} />
      <AmbientDetails isEnding={scene === "ending"} />
      <AnimatePresence mode="wait">
        {scene === "question" && (
          <motion.section key="question" className="absolute inset-0 flex items-center justify-center" exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.45 }}>
            <CardBotanicalDetails />
            <div className="relative w-[540px]">
              {/* Layer 1: Kraft/pink torn paper scrap rotated -2.5deg */}
              <div className="absolute inset-0 translate-x-3 translate-y-3.5 rounded-2xl border border-pink-300/40 bg-[#FBEBE8] shadow-md -rotate-[2.5deg] pointer-events-none" />
              
              {/* Layer 2: Pastel dot paper scrap rotated +1.8deg */}
              <div className="absolute inset-0 -translate-x-3 translate-y-2 rounded-2xl border border-rose-300/40 bg-[#FFF0F3] rotate-[1.8deg] pointer-events-none" />

              {/* Main Scrapbook Journal Card */}
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="scrapbook-card relative rounded-2xl border-2 border-[#F0D5DD]/90 bg-[#FFFDF9] px-14 py-12 text-center backdrop-blur-sm shadow-2xl">
                {/* Washi Tapes */}
                <div className="washi-tape-gold absolute -top-4 -left-6 h-8 w-28 -rotate-12 rounded-xs opacity-90 select-none shadow-sm flex items-center justify-center">
                  <span className="text-[11px] text-amber-900/50 font-hand font-bold">♡ xoxo</span>
                </div>
                <div className="washi-tape-pink absolute -top-4 -right-6 h-8 w-28 rotate-12 rounded-xs opacity-90 select-none shadow-sm flex items-center justify-center">
                  <span className="text-[11px] text-rose-900/50 font-hand font-bold">✦ special</span>
                </div>

                {/* Top Scrapbook Badge */}
                <div className="mb-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#FFE4EC] px-5 py-1.5 text-[#B83B5E] border border-dashed border-[#F092A9] shadow-xs">
                  <Heart size={14} strokeWidth={2.5} className="fill-[#B83B5E]/30 text-[#B83B5E]" />
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#B83B5E]">Secret Challenge</span>
                </div>

                {/* Subtitle */}
                <p className="mb-2 font-hand text-xl font-bold text-[#A85B70] tracking-wider">
                  ~ A very important question ~
                </p>

                {/* Main Title "Do you love me?" with Pinterest Display Font */}
                <div className="relative my-3 inline-block">
                  <span className="absolute -inset-x-3 bottom-1.5 h-4 bg-[#FFD6E0]/60 -rotate-1 rounded-sm -z-10" />
                  <h1 className="font-scrapbook text-6xl sm:text-7xl font-extrabold leading-tight tracking-tight text-[#4A2E35] drop-shadow-xs">
                    Do you love me?
                  </h1>
                </div>

                {/* Buttons Area */}
                <div className="mt-10 flex items-center justify-center gap-6">
                  <Button 
                    variant="love" 
                    onClick={sayYes}
                    className="btn-yes-scrapbook text-lg font-extrabold h-14 min-w-[140px] px-9 rounded-full shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Yes</span>
                    <Heart size={18} className="fill-white/80 stroke-none" />
                  </Button>
                  <div className="h-14 w-36" />
                </div>
              </motion.div>
            </div>

            {/* No Button Container */}
            <motion.div ref={noRef} className="absolute left-1/2 top-[60%]" animate={{ x: noPosition.x, y: noPosition.y }} transition={{ type: "spring", stiffness: 110, damping: 18, mass: 0.8 }}>
              <div className="relative">
                {/* Floating Playful Badge & Sparkles around No button */}
                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-hand text-xs font-bold text-[#FF2E63] bg-[#FFE0E6] border border-[#FF99AA] px-2.5 py-0.5 rounded-full shadow-xs animate-bounce select-none">
                  ✨ Try me! ✨
                </span>
                <span className="pointer-events-none absolute -top-4 -right-3 text-amber-400 animate-sparkle-1 text-base select-none">✦</span>
                <span className="pointer-events-none absolute -bottom-3 -left-4 text-pink-500 animate-sparkle-2 text-sm select-none">✨</span>
                <span className="pointer-events-none absolute -top-3 left-3 text-rose-400 animate-sparkle-3 text-xs select-none">💖</span>
                <span className="pointer-events-none absolute -right-5 bottom-1 text-amber-500 animate-float-1 text-sm select-none">✧</span>

                <Button 
                  variant="paper" 
                  tabIndex={-1} 
                  onFocus={dodge} 
                  onPointerDown={(event) => { event.preventDefault(); dodge(); }} 
                  aria-label="No — if you can catch it"
                  className="btn-no-mischievous text-lg font-black h-14 min-w-[140px] px-10 rounded-full shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>No</span>
                  <span className="text-sm">😜</span>
                </Button>
              </div>
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
          <motion.section key="challenge" className="absolute inset-0 flex items-center justify-center text-center px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -15 }}>
            <div className="max-w-3xl flex flex-col items-center">
              {/* GREAT. Heading - High-end Editorial Serif, Dramatic Focal Point */}
              <motion.h1 
                initial={{ opacity: 0, y: 16 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="font-serif text-8xl sm:text-[9.5rem] font-extrabold tracking-tight text-[#2B141C] drop-shadow-xs leading-none"
              >
                Great.
              </motion.h1>

              <AnimatePresence>
                {challengeLine && (
                  <motion.div 
                    initial={{ opacity: 0, y: 16 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center mt-9"
                  >
                    {/* Supporting Text - Clean Modern Sans-Serif, High Contrast, Very Readable */}
                    <p className="text-xl sm:text-2xl font-bold tracking-wide text-[#592D3B] max-w-lg leading-relaxed mb-10">
                      Now win this game to get rid of me.
                    </p>

                    {/* START Button - Dominant Primary Action */}
                    <Button 
                      variant="love" 
                      onClick={startGame}
                      className="btn-start-editorial text-xl sm:text-2xl font-extrabold h-16 min-w-[180px] px-12 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer tracking-wider uppercase flex items-center justify-center"
                    >
                      Start
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        )}

        {scene === "game" && (
          <motion.section key="game" className="absolute inset-0 watercolor-sky-bg sewing-pin-cursor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BalloonPatternDefs />
            <WatercolorClouds />
            <GameHeaderScrapbook score={score} onQuit={() => setScene("ending")} />

            {/* Edge Details around the game screen margin */}
            <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
              <span className="absolute left-[3%] top-[38%] text-rose-400/60 text-2xl font-hand select-none animate-bounce">💖</span>
              <span className="absolute right-[4%] top-[32%] text-amber-400/70 text-xl font-hand select-none animate-sparkle-1">✦</span>
              <span className="absolute left-[4%] bottom-[25%] text-pink-400/60 text-lg font-hand select-none animate-sparkle-2">✨</span>
              <span className="absolute right-[5%] bottom-[22%] text-rose-500/60 text-2xl font-hand select-none animate-float-1">🌸</span>
            </div>

            {/* Central Game Arena */}
            <div className="absolute inset-x-0 bottom-16 top-36">
              <AnimatePresence>
                {balloons.map((balloon) => (
                  <PinterestBalloon key={balloon.id} balloon={balloon} onClick={() => popBalloon(balloon)} />
                ))}
              </AnimatePresence>
              {bursts.map((burst) => (
                <div key={burst.id} className="pointer-events-none absolute z-20" style={{ left: `${burst.x}%`, top: `${burst.y}%` }}>
                  {Array.from({ length: 12 }).map((_, index) => {
                    const angle = (Math.PI * 2 * index) / 12;
                    const distance = 55 + (index % 3) * 18;
                    const icons = ["✨", "💖", "🌸", "🍒", "⭐"];
                    const icon = icons[index % icons.length];
                    return (
                      <motion.span
                        key={index}
                        className="absolute font-hand text-xl select-none"
                        initial={{ x: 45, y: 45, scale: 0.5, opacity: 1 }}
                        animate={{
                          x: 45 + Math.cos(angle) * distance,
                          y: 45 + Math.sin(angle) * distance,
                          scale: [1, 1.25, 0],
                          opacity: [1, 0.9, 0],
                          rotate: [0, 90],
                        }}
                        transition={{ duration: 0.65, ease: "easeOut" }}
                      >
                        {icon}
                      </motion.span>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {scene === "ending" && (
          <motion.section 
            key="ending" 
            className="absolute inset-0 flex items-center justify-center text-center p-6 z-10" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.8 }}
          >
            {/* Ambient subtle sparkles around the note */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
              <span className="absolute left-[14%] top-[18%] text-amber-400 text-2xl font-hand select-none animate-bounce">✨</span>
              <span className="absolute right-[16%] top-[22%] text-rose-400 text-xl font-hand select-none animate-sparkle-1">💖</span>
              <span className="absolute left-[18%] bottom-[22%] text-pink-400 text-lg font-hand select-none animate-sparkle-2">✦</span>
              <span className="absolute right-[20%] bottom-[25%] text-amber-400 text-2xl font-hand select-none animate-sparkle-3">⭐</span>
              <span className="absolute left-[26%] top-[12%] text-rose-500/70 text-base font-hand select-none animate-float-1">🌸</span>
              <span className="absolute right-[28%] bottom-[16%] text-pink-500/70 text-xl font-hand select-none animate-float-2">👑</span>
            </div>

            <div className="relative w-full max-w-[640px]">
              {/* Layer 1: Pink/kraft paper scrap rotated -3deg */}
              <div className="absolute inset-0 translate-x-3.5 translate-y-3.5 rounded-3xl border border-pink-300/40 bg-[#FCE4EC] shadow-md -rotate-[3deg] pointer-events-none" />

              {/* Layer 2: Pastel dot paper scrap rotated +2deg */}
              <div className="absolute inset-0 -translate-x-3.5 translate-y-2 rounded-3xl border border-rose-300/40 bg-[#FFF0F3] rotate-[2deg] pointer-events-none" />

              {/* Main Scrapbook Journal Card */}
              <motion.div 
                initial={{ scale: 0.92, opacity: 0, y: 16 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} 
                className="scrapbook-card relative rounded-3xl border-2 border-[#F0B8C6]/90 bg-[#FFFDF9] px-8 sm:px-14 py-10 sm:py-12 text-center backdrop-blur-xs shadow-[0_25px_65px_-12px_rgba(160,40,70,0.24)] -rotate-[0.5deg]"
              >
                {/* Washi Tapes */}
                <div className="washi-tape-gold absolute -top-4 -left-7 h-8 w-34 -rotate-12 rounded-xs opacity-90 select-none shadow-sm flex items-center justify-center pointer-events-none">
                  <span className="text-[11px] text-amber-900/60 font-hand font-bold">♡ SISTER'S NOTE</span>
                </div>
                <div className="washi-tape-pink absolute -top-4 -right-7 h-8 w-34 rotate-12 rounded-xs opacity-90 select-none shadow-sm flex items-center justify-center pointer-events-none">
                  <span className="text-[11px] text-rose-900/60 font-hand font-bold">VICTORY xoxo 💅</span>
                </div>

                {/* Top Corner Scrapbook Button Detail */}
                <div className="absolute top-4 right-5 opacity-80 pointer-events-none rotate-12">
                  <ScrapbookButton type="pink-flower" size={28} className="drop-shadow-xs" />
                </div>

                {/* Top Celebratory Announcement Badge */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2 }} 
                  className="mb-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#FFE4EC] px-6 py-1.5 text-[#B83B5E] border border-dashed border-[#F092A9] shadow-xs"
                >
                  <span className="text-sm">🏆</span>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-[#B83B5E]">
                    Sister Wins!
                  </span>
                  <span className="text-sm">👑</span>
                </motion.div>

                {/* "Hahaha..." Header */}
                <div className="relative inline-block my-1">
                  {/* Floating Victory Crown */}
                  <span className="absolute -top-7 -right-5 text-3xl select-none animate-bounce" title="Crown of victory">👑</span>
                  <span className="absolute -top-4 -left-6 text-xl text-amber-400 font-hand select-none animate-sparkle-1">✨</span>
                  
                  <motion.h2 
                    className="font-scrapbook text-7xl sm:text-8xl md:text-[5.5rem] font-extrabold text-[#7A243A] leading-tight tracking-tight drop-shadow-xs -rotate-2 select-none" 
                    initial={{ opacity: 0, scale: 0.85 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ delay: 0.35, duration: 0.5, type: "spring", stiffness: 140 }}
                  >
                    Hahaha...
                  </motion.h2>
                </div>

                {/* Doodled Arrow & Annotations */}
                <motion.div 
                  className="relative my-3 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  {/* Left annotation */}
                  <span className="hidden sm:block absolute -left-4 top-1 font-hand text-base font-bold text-[#B85A70] -rotate-6 select-none">
                    ~ 100% Impossible ~
                  </span>

                  {/* Doodled SVG Arrow pointing down to punchline */}
                  <svg width="180" height="38" viewBox="0 0 180 38" fill="none" className="text-[#D45D79] overflow-visible">
                    <path d="M 30 5 Q 90 35 150 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3" fill="none" />
                    <path d="M 142 5 L 152 13 L 145 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>

                  {/* Right doodle tag */}
                  <span className="absolute -right-2 sm:right-2 top-0 font-hand text-lg font-extrabold text-[#992244] rotate-6 bg-[#FFF0F3] px-2.5 py-0.5 rounded-md border border-[#F092A9]/40 shadow-xs select-none">
                    Told ya! 😜
                  </span>
                </motion.div>

                {/* Main Punchline: "Seems like you can never get rid of me." */}
                <motion.div 
                  className="relative my-2 inline-block px-3 py-1.5"
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 1.15, duration: 0.65 }}
                >
                  {/* Soft pink highlighter tape background for ultimate contrast & visual punch */}
                  <span className="absolute -inset-x-4 inset-y-0.5 bg-[#FFD6E0]/85 -rotate-1 rounded-md -z-10 shadow-xs border border-[#F0A0B2]/40" />

                  <p className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-[#2B1019] tracking-tight leading-snug drop-shadow-xs">
                    Seems like you can never get rid of me.
                  </p>
                </motion.div>

                {/* Cute Doodled Annotation Row */}
                <motion.div 
                  className="mt-5 flex items-center justify-center gap-3 font-hand text-lg font-bold text-[#A3485E]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <span className="text-amber-500">⭐</span>
                  <span>forever your sister</span>
                  <span className="text-rose-500">💖</span>
                  <span>stuck together</span>
                  <span className="text-amber-500">✨</span>
                </motion.div>

                {/* Scrapbook-Themed Restart Button */}
                <motion.div 
                  className="mt-8 flex justify-center"
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 1.9, duration: 0.5 }}
                >
                  <button
                    type="button"
                    onClick={restart}
                    className="group relative inline-flex items-center gap-3 rounded-full border-2 border-dashed border-[#F092A9] bg-gradient-to-r from-[#FFF4F7] via-[#FFE4EC] to-[#FFF0F4] px-8 py-3.5 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer text-[#7A283C] font-scrapbook font-extrabold text-xl tracking-wide"
                  >
                    <ScrapbookButton type="pink-flower" size={24} className="drop-shadow-xs group-hover:rotate-45 transition-transform duration-300" />
                    <span>Restart</span>
                    <RotateCcw className="size-5 text-[#B83B5E] group-hover:-rotate-180 transition-transform duration-500" />
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      <div className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 font-hand text-2xl text-[#8E4D5E] font-bold tracking-wide select-none">
        <ScrapbookButton type="pink-flower" size={24} />
        <span>Made with affection &amp; poor intentions</span>
        <ScrapbookButton type="green-heart" size={24} />
      </div>
    </main>
  );
}

type BalloonTheme = {
  from: string;
  to: string;
  stroke: string;
  knot: string;
  bow: string;
  bowKnot: string;
  string: string;
};

const balloonThemes: Record<BalloonColor, BalloonTheme> = {
  sage: {
    from: "#94B89D",
    to: "#62886A",
    stroke: "#4A6E52",
    knot: "#567B5E",
    bow: "#FFE4EC",
    bowKnot: "#F092A9",
    string: "rgba(74, 110, 82, 0.45)",
  },
  blue: {
    from: "#9BC1E2",
    to: "#6A95BE",
    stroke: "#487299",
    knot: "#5B85AD",
    bow: "#FFF4D6",
    bowKnot: "#E5B842",
    string: "rgba(72, 114, 153, 0.45)",
  },
  cream: {
    from: "#F5E5BA",
    to: "#DBC28D",
    stroke: "#B0965D",
    knot: "#C4AB74",
    bow: "#FFD6E0",
    bowKnot: "#E57593",
    string: "rgba(176, 150, 93, 0.45)",
  },
  peach: {
    from: "#F7C3A8",
    to: "#E29878",
    stroke: "#B86846",
    knot: "#C87C5B",
    bow: "#E2F4E6",
    bowKnot: "#67B87F",
    string: "rgba(184, 104, 70, 0.45)",
  },
  rose: {
    from: "#EEA8B8",
    to: "#D4788C",
    stroke: "#9E3B52",
    knot: "#BA5C70",
    bow: "#FFF8DC",
    bowKnot: "#D6B042",
    string: "rgba(158, 59, 82, 0.45)",
  },
};

function BalloonPatternDefs() {
  return (
    <svg width="0" height="0" className="absolute size-0 overflow-hidden" aria-hidden="true">
      <defs>
        {/* Sage: Daisy Flowers Pattern */}
        <pattern id="pattern-sage" width="24" height="24" patternUnits="userSpaceOnUse">
          <g transform="translate(12,12) scale(0.65)">
            <circle cx="0" cy="-5" r="3.5" fill="white" opacity="0.9" />
            <circle cx="5" cy="0" r="3.5" fill="white" opacity="0.9" />
            <circle cx="0" cy="5" r="3.5" fill="white" opacity="0.9" />
            <circle cx="-5" cy="0" r="3.5" fill="white" opacity="0.9" />
            <circle cx="0" cy="0" r="3" fill="#FFD166" />
          </g>
        </pattern>

        {/* Blue: Gingham Check Pattern */}
        <pattern id="pattern-blue" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="transparent" />
          <rect width="10" height="20" fill="white" fillOpacity="0.25" />
          <rect width="20" height="10" fill="white" fillOpacity="0.25" />
        </pattern>

        {/* Cream: Golden Stars & Dots Pattern */}
        <pattern id="pattern-cream" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M 6 4 L 7.5 7.5 L 11 8 L 8.5 10.5 L 9 14 L 6 12 L 3 14 L 3.5 10.5 L 1 8 L 4.5 7.5 Z" fill="#FFE066" opacity="0.85" transform="scale(0.6)" />
          <circle cx="17" cy="15" r="1.5" fill="white" opacity="0.8" />
          <circle cx="18" cy="5" r="1" fill="#FFE066" opacity="0.7" />
        </pattern>

        {/* Peach: Cherries Pattern */}
        <pattern id="pattern-peach" width="26" height="26" patternUnits="userSpaceOnUse">
          <g transform="translate(13,13) scale(0.6)">
            <path d="M -3 -8 Q 0 -14 6 -10 Q 3 -14 -3 -8" stroke="#5C8259" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <circle cx="-4" cy="-5" r="3.8" fill="#E63946" />
            <circle cx="4" cy="-5" r="3.8" fill="#D90429" />
            <circle cx="-5" cy="-6" r="1" fill="white" opacity="0.7" />
            <circle cx="3" cy="-6" r="1" fill="white" opacity="0.7" />
          </g>
        </pattern>

        {/* Rose: Mini Hearts Pattern */}
        <pattern id="pattern-rose" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M 11 16 C 5 12 2 9 2 6 C 2 3.5 4 2 6.5 2 C 8 2 9.5 3 11 4.5 C 12.5 3 14 2 15.5 2 C 18 2 20 3.5 20 6 C 20 9 17 12 11 16 Z" fill="white" opacity="0.55" transform="translate(0,-2) scale(0.65)" />
        </pattern>

        {/* Dynamic Color Gradients */}
        {(Object.keys(balloonThemes) as BalloonColor[]).map((color) => {
          const theme = balloonThemes[color];
          return (
            <radialGradient id={`grad-${color}`} key={color} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
              <stop offset="25%" stopColor={theme.from} />
              <stop offset="100%" stopColor={theme.to} />
            </radialGradient>
          );
        })}
      </defs>
    </svg>
  );
}

function PinterestBalloon({ balloon, onClick }: { balloon: BalloonData; onClick: () => void }) {
  const theme = balloonThemes[balloon.color];

  return (
    <motion.button
      type="button"
      aria-label={`Pop ${balloon.color} balloon`}
      className="absolute cursor-pointer select-none outline-none group sewing-pin-cursor"
      style={{ left: `${balloon.x}%`, top: `${balloon.y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        y: [0, -14, 0, 10, 0],
        rotate: [0, 2, 0, -2, 0],
        scale: 1,
        opacity: 1,
      }}
      exit={{ scale: [1, 1.25, 0], opacity: [1, 1, 0] }}
      transition={{
        y: { duration: balloon.drift, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: balloon.drift, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 0.28 },
        opacity: { duration: 0.24 },
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      <svg width="115" height="175" viewBox="0 0 110 170" fill="none" className="drop-shadow-md group-hover:drop-shadow-xl transition-all">
        {/* String */}
        <path d="M 55 116 Q 49 135 58 152 T 53 170" stroke={theme.string} strokeWidth="1.6" strokeDasharray="4 2" fill="none" />

        {/* Ambient Balloon Shadow */}
        <ellipse cx="55" cy="113" rx="36" ry="9" fill="rgba(60, 20, 30, 0.12)" filter="blur(4px)" />

        {/* Balloon Body Main Base */}
        <path d="M 55 10 C 24 10 10 36 10 66 C 10 96 34 112 55 112 C 76 112 100 96 100 66 C 100 36 86 10 55 10 Z" fill={`url(#grad-${balloon.color})`} stroke={theme.stroke} strokeWidth="1.5" />

        {/* Pattern Layer */}
        <path d="M 55 10 C 24 10 10 36 10 66 C 10 96 34 112 55 112 C 76 112 100 96 100 66 C 100 36 86 10 55 10 Z" fill={`url(#pattern-${balloon.color})`} opacity="0.85" />

        {/* Glossy Specular Sheen 1 (Curved streak top-left) */}
        <path d="M 28 24 C 20 38 20 58 28 72 C 24 58 24 38 34 26 Z" fill="white" opacity="0.55" />

        {/* Glossy Specular Highlight Spot 2 (Top Oval) */}
        <ellipse cx="40" cy="24" rx="9" ry="4.5" fill="white" opacity="0.6" transform="rotate(-32 40 24)" />

        {/* Balloon Knot at Bottom */}
        <path d="M 47 111 L 63 111 L 55 119 Z" fill={theme.knot} stroke={theme.stroke} strokeWidth="1" />

        {/* Cute Ribbon Bow tied at Knot */}
        <g transform="translate(55, 118)">
          <path d="M 0 0 C -12 -8, -16 4, 0 2 Z" fill={theme.bow} stroke="white" strokeWidth="0.8" />
          <path d="M 0 0 C 12 -8, 16 4, 0 2 Z" fill={theme.bow} stroke="white" strokeWidth="0.8" />
          <circle cx="0" cy="0" r="3" fill={theme.bowKnot} stroke="white" strokeWidth="0.8" />
          <path d="M -1 2 Q -6 10 -10 16" stroke={theme.bow} strokeWidth="2" strokeLinecap="round" />
          <path d="M 1 2 Q 6 10 10 16" stroke={theme.bow} strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </motion.button>
  );
}

function WatercolorClouds() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Top Left Cloud */}
      <svg className="absolute left-[3%] top-[6%] w-[280px] opacity-70 animate-cloud-slow" viewBox="0 0 200 100" fill="none">
        <defs>
          <radialGradient id="cloud-grad-1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#F5F0FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E6F0FA" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M 30 70 A 25 25 0 0 1 45 35 A 35 35 0 0 1 115 30 A 30 30 0 0 1 165 50 A 25 25 0 0 1 170 75 Z" fill="url(#cloud-grad-1)" filter="blur(3px)" />
        <path d="M 35 68 A 20 20 0 0 1 48 38 A 30 30 0 0 1 110 34 A 25 25 0 0 1 158 52 A 20 20 0 0 1 165 70 Z" fill="white" opacity="0.8" />
      </svg>

      {/* Top Right Cloud */}
      <svg className="absolute right-[5%] top-[8%] w-[330px] opacity-65 animate-cloud-reverse" viewBox="0 0 240 110" fill="none">
        <defs>
          <radialGradient id="cloud-grad-2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="75%" stopColor="#FFF0F5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#E6F0FA" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M 40 80 A 30 30 0 0 1 60 40 A 40 40 0 0 1 140 32 A 35 35 0 0 1 200 55 A 28 28 0 0 1 210 85 Z" fill="url(#cloud-grad-2)" filter="blur(4px)" />
        <path d="M 45 78 A 25 25 0 0 1 62 43 A 35 35 0 0 1 135 36 A 30 30 0 0 1 192 57 A 24 24 0 0 1 202 82 Z" fill="white" opacity="0.85" />
      </svg>

      {/* Mid Left Low Cloud */}
      <svg className="absolute left-[2%] top-[45%] w-[240px] opacity-45 animate-cloud-slow" viewBox="0 0 200 90" fill="none">
        <path d="M 25 65 A 20 20 0 0 1 40 32 A 30 30 0 0 1 105 28 A 25 25 0 0 1 150 48 A 20 20 0 0 1 155 70 Z" fill="white" filter="blur(4px)" />
      </svg>
    </div>
  );
}

function GameHeaderScrapbook({ score, onQuit }: { score: number; onQuit: () => void }) {
  return (
    <header className="absolute inset-x-0 top-4 z-40 px-6 sm:px-12 flex items-start justify-between pointer-events-none">
      {/* Left Scrapbook Tag / Tape Detail */}
      <div className="pointer-events-auto flex items-center gap-2 opacity-90">
        <div className="washi-tape-pink h-7 px-3.5 rounded-xs shadow-xs flex items-center gap-1.5 -rotate-3">
          <Heart size={12} className="fill-[#B83B5E] text-[#B83B5E]" />
          <span className="text-xs font-hand font-bold text-[#7A283C]">Balloon Quest</span>
        </div>
      </div>

      {/* Center Big Objective Banner + Score Label */}
      <div className="pointer-events-auto flex flex-col items-center max-w-2xl text-center">
        {/* Scrapbook Journal Note Container */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="scrapbook-card relative rounded-2xl border-2 border-[#F0D5DD] bg-[#FFFDF9] px-7 sm:px-10 py-4 text-center shadow-xl backdrop-blur-sm -rotate-0.5"
        >
          {/* Top Washi Tape Corner Strips */}
          <div className="washi-tape-pink absolute -top-3.5 left-6 h-7 w-24 -rotate-6 rounded-xs opacity-90 shadow-xs flex items-center justify-center pointer-events-none">
            <span className="text-[10px] text-rose-900/60 font-hand font-bold">✦ objective</span>
          </div>
          <div className="washi-tape-gold absolute -top-3.5 right-6 h-7 w-24 rotate-6 rounded-xs opacity-90 shadow-xs flex items-center justify-center pointer-events-none">
            <span className="text-[10px] text-amber-900/60 font-hand font-bold">xoxo ♡</span>
          </div>

          {/* Objective Title - Big, Visible, Eye-catching */}
          <div className="relative inline-block mt-1">
            <span className="absolute -inset-x-2 bottom-1 h-3.5 bg-[#FFD6E0]/60 -rotate-0.5 rounded-xs -z-10" />
            <h1 className="font-scrapbook text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#3D2229] tracking-tight leading-snug">
              Clear/pop all the balloons from the screen to get rid of me.
            </h1>
          </div>

          {/* Subtext */}
          <p className="font-hand text-base sm:text-lg font-bold text-[#9E4B62] mt-1 tracking-wide">
            ~ Leave no balloons floating in the sky! ~
          </p>

          {/* Score Counter as Stitched Scrapbook Label */}
          <div className="mt-3 inline-flex items-center gap-3 rounded-2xl border-2 border-dashed border-[#F0A8B8] bg-[#FFF8FA] px-5 py-1.5 shadow-sm">
            <ScrapbookButton type="pink-flower" size={24} className="drop-shadow-xs" />
            <div className="flex items-center gap-2">
              <motion.span
                key={score}
                initial={{ scale: 1.3, color: "#E03860" }}
                animate={{ scale: 1, color: "#9E3B5E" }}
                transition={{ duration: 0.3 }}
                className="font-scrapbook text-2xl sm:text-3xl font-extrabold tabular-nums"
              >
                {score}
              </motion.span>
              <span className="font-hand text-lg font-bold text-[#B85C70]">/ 5</span>
            </div>
            <span className="rounded-full bg-[#FFE4EC] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#B83B5E] border border-[#F092A9]">
              popped
            </span>
          </div>
        </motion.div>
      </div>

      {/* Right Quit Button as Cute Paper Tag */}
      <div className="pointer-events-auto">
        <motion.button
          whileHover={{ rotate: 3, scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={onQuit}
          className="scrapbook-card relative flex items-center gap-2 rounded-xl border-2 border-[#F0C2CC] bg-[#FFF9FA] px-4 py-2 shadow-md hover:shadow-lg transition-all cursor-pointer group"
        >
          <span className="size-2.5 rounded-full border border-[#D0B0B8] bg-[#F2DCE0] inline-block mr-0.5" />
          <X size={16} className="text-[#B83B5E] group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-hand text-lg font-extrabold text-[#4A2E35]">Quit</span>
        </motion.button>
      </div>
    </header>
  );
}

type ScrapbookButtonType =
  | "apple-gingham"
  | "red-dot"
  | "yellow-star"
  | "green-heart"
  | "cream-round"
  | "pink-flower"
  | "yellow-blue-dot"
  | "pink-floral"
  | "blue-gingham-heart"
  | "lime-flower";

function ScrapbookButton({ type, size = 44, className = "" }: { type: ScrapbookButtonType; size?: number; className?: string }) {
  switch (type) {
    case "apple-gingham":
      return (
        <svg width={size} height={size} viewBox="0 0 50 50" fill="none" className={className}>
          <defs>
            <pattern id="gingham-apple" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill="#FFC2D1" />
              <rect width="4" height="8" fill="#FF85A1" fillOpacity="0.6" />
              <rect width="8" height="4" fill="#FF85A1" fillOpacity="0.6" />
            </pattern>
            <filter id="shadow-apple" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#8B3A4A" floodOpacity="0.3" />
            </filter>
          </defs>
          <g filter="url(#shadow-apple)">
            {/* Stem */}
            <path d="M25 10 C 27 5, 30 3, 31 5" stroke="#5C3D2E" strokeWidth="2.5" strokeLinecap="round" />
            {/* Leaf */}
            <path d="M25 10 C 22 5, 17 6, 18 9 C 20 12, 24 11, 25 10 Z" fill="#7FA982" />
            {/* Apple body */}
            <path d="M25 10 C 15 10, 8 16, 8 28 C 8 40, 16 46, 25 46 C 34 46, 42 40, 42 28 C 42 16, 35 10, 25 10 Z" fill="url(#gingham-apple)" stroke="#E05775" strokeWidth="1.5" />
            {/* Outer Rim Shadow */}
            <path d="M25 12 C 16 12, 10 17, 10 28 C 10 39, 17 44, 25 44 C 33 44, 40 39, 40 28 C 40 17, 34 12, 25 12 Z" stroke="white" strokeWidth="1" opacity="0.5" />
            {/* 4 Thread Holes */}
            <circle cx="21" cy="25" r="2" fill="#5C2434" />
            <circle cx="29" cy="25" r="2" fill="#5C2434" />
            <circle cx="21" cy="33" r="2" fill="#5C2434" />
            <circle cx="29" cy="33" r="2" fill="#5C2434" />
            {/* Thread Stitching */}
            <line x1="21" y1="25" x2="29" y2="33" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="29" y1="25" x2="21" y2="33" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        </svg>
      );

    case "red-dot":
      return (
        <svg width={size} height={size} viewBox="0 0 50 50" fill="none" className={className}>
          <defs>
            <pattern id="polka-red" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="#E63946" />
              <circle cx="5" cy="5" r="2" fill="white" />
            </pattern>
            <radialGradient id="red-bevel" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="white" stopOpacity="0.4" />
              <stop offset="60%" stopColor="transparent" />
              <stop offset="100%" stopColor="black" stopOpacity="0.25" />
            </radialGradient>
          </defs>
          <circle cx="25" cy="25" r="22" fill="url(#polka-red)" stroke="#B71C1C" strokeWidth="1.5" />
          <circle cx="25" cy="25" r="22" fill="url(#red-bevel)" />
          <circle cx="25" cy="25" r="16" stroke="white" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
          {/* Thread Holes */}
          <circle cx="20" cy="25" r="2.2" fill="#600000" />
          <circle cx="30" cy="25" r="2.2" fill="#600000" />
          <line x1="20" y1="25" x2="30" y2="25" stroke="#FFFDF9" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case "yellow-star":
      return (
        <svg width={size} height={size} viewBox="0 0 50 50" fill="none" className={className}>
          <g>
            <path d="M25 4 L31 16 L45 18 L35 28 L37 42 L25 35 L13 42 L15 28 L5 18 L19 16 Z" fill="#FFD166" stroke="#E6B800" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M25 7 L30 17 L42 19 L33 27 L35 39 L25 33 L15 39 L17 27 L8 19 L20 17 Z" fill="white" opacity="0.3" />
            <circle cx="21" cy="23" r="1.8" fill="#7A6000" />
            <circle cx="29" cy="23" r="1.8" fill="#7A6000" />
            <circle cx="21" cy="29" r="1.8" fill="#7A6000" />
            <circle cx="29" cy="29" r="1.8" fill="#7A6000" />
            <line x1="21" y1="23" x2="29" y2="29" stroke="#FFFDF9" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="29" y1="23" x2="21" y2="29" stroke="#FFFDF9" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        </svg>
      );

    case "green-heart":
      return (
        <svg width={size} height={size} viewBox="0 0 50 50" fill="none" className={className}>
          <path d="M25 44 C 10 33, 4 24, 4 15 C 4 7, 11 3, 18 3 C 22 3, 24 5, 25 8 C 26 5, 28 3, 32 3 C 39 3, 46 7, 46 15 C 46 24, 40 33, 25 44 Z" fill="#84A580" stroke="#4F6D4C" strokeWidth="1.5" />
          <path d="M25 40 C 13 30, 7 22, 7 15 C 7 9, 12 6, 18 6 C 21 6, 23 8, 25 10 C 27 8, 29 6, 32 6 C 38 6, 43 9, 43 15 C 43 22, 37 30, 25 40 Z" stroke="white" strokeWidth="1" opacity="0.4" fill="none" />
          <circle cx="20" cy="18" r="2" fill="#2E422C" />
          <circle cx="30" cy="18" r="2" fill="#2E422C" />
          <circle cx="20" cy="26" r="2" fill="#2E422C" />
          <circle cx="30" cy="26" r="2" fill="#2E422C" />
          <line x1="20" y1="18" x2="30" y2="26" stroke="#FFFDF9" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="30" y1="18" x2="20" y2="26" stroke="#FFFDF9" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );

    case "cream-round":
      return (
        <svg width={size} height={size} viewBox="0 0 50 50" fill="none" className={className}>
          <circle cx="25" cy="25" r="22" fill="#FAF3E0" stroke="#D4C5A9" strokeWidth="1.5" />
          <circle cx="25" cy="25" r="16" fill="#F4ECE1" stroke="#C5B597" strokeWidth="1" />
          <circle cx="20" cy="20" r="2" fill="#6B5B45" />
          <circle cx="30" cy="20" r="2" fill="#6B5B45" />
          <circle cx="20" cy="30" r="2" fill="#6B5B45" />
          <circle cx="30" cy="30" r="2" fill="#6B5B45" />
          <line x1="20" y1="20" x2="30" y2="30" stroke="#B87333" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="30" y1="20" x2="20" y2="30" stroke="#B87333" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    case "pink-flower":
      return (
        <svg width={size} height={size} viewBox="0 0 50 50" fill="none" className={className}>
          <g>
            <circle cx="25" cy="12" r="10" fill="#FFB7C5" stroke="#E07A8B" strokeWidth="1" />
            <circle cx="37" cy="21" r="10" fill="#FFB7C5" stroke="#E07A8B" strokeWidth="1" />
            <circle cx="33" cy="36" r="10" fill="#FFB7C5" stroke="#E07A8B" strokeWidth="1" />
            <circle cx="17" cy="36" r="10" fill="#FFB7C5" stroke="#E07A8B" strokeWidth="1" />
            <circle cx="13" cy="21" r="10" fill="#FFB7C5" stroke="#E07A8B" strokeWidth="1" />
            <circle cx="25" cy="25" r="11" fill="#FFDAC1" stroke="#E5989B" strokeWidth="1.5" />
            <circle cx="21" cy="25" r="2" fill="#8B4513" />
            <circle cx="29" cy="25" r="2" fill="#8B4513" />
            <line x1="21" y1="25" x2="29" y2="25" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </svg>
      );

    case "yellow-blue-dot":
      return (
        <svg width={size} height={size} viewBox="0 0 50 50" fill="none" className={className}>
          <defs>
            <pattern id="dot-yellow" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="#FDE24F" />
              <circle cx="5" cy="5" r="2.2" fill="#8ECAE6" />
            </pattern>
          </defs>
          <circle cx="25" cy="25" r="22" fill="url(#dot-yellow)" stroke="#D4B200" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="2" fill="#405060" />
          <circle cx="30" cy="20" r="2" fill="#405060" />
          <circle cx="20" cy="30" r="2" fill="#405060" />
          <circle cx="30" cy="30" r="2" fill="#405060" />
          <line x1="20" y1="20" x2="30" y2="30" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="30" y1="20" x2="20" y2="30" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );

    case "pink-floral":
      return (
        <svg width={size} height={size} viewBox="0 0 50 50" fill="none" className={className}>
          <circle cx="25" cy="25" r="22" fill="#FFF8F0" stroke="#E2C0A5" strokeWidth="1.5" />
          <path d="M12 18 Q 15 14 18 18 Q 21 22 18 25" stroke="#E56B8F" strokeWidth="1.5" fill="none" />
          <path d="M32 30 Q 35 26 38 30 Q 41 34 38 37" stroke="#E56B8F" strokeWidth="1.5" fill="none" />
          <circle cx="20" cy="20" r="2" fill="#7A4E3A" />
          <circle cx="30" cy="20" r="2" fill="#7A4E3A" />
          <circle cx="20" cy="30" r="2" fill="#7A4E3A" />
          <circle cx="30" cy="30" r="2" fill="#7A4E3A" />
          <line x1="20" y1="20" x2="30" y2="20" stroke="#7A4E3A" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="20" y1="30" x2="30" y2="30" stroke="#7A4E3A" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    case "blue-gingham-heart":
      return (
        <svg width={size} height={size} viewBox="0 0 50 50" fill="none" className={className}>
          <defs>
            <pattern id="gingham-blue" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill="#E2ECE9" />
              <rect width="4" height="8" fill="#A8DADC" fillOpacity="0.7" />
              <rect width="8" height="4" fill="#F4ACB7" fillOpacity="0.5" />
            </pattern>
          </defs>
          <path d="M25 44 C 10 33, 4 24, 4 15 C 4 7, 11 3, 18 3 C 22 3, 24 5, 25 8 C 26 5, 28 3, 32 3 C 39 3, 46 7, 46 15 C 46 24, 40 33, 25 44 Z" fill="url(#gingham-blue)" stroke="#457B9D" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="2.2" fill="#1D3557" />
          <circle cx="30" cy="20" r="2.2" fill="#1D3557" />
          <path d="M20 20 Q 25 24 30 20" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </svg>
      );

    case "lime-flower":
      return (
        <svg width={size} height={size} viewBox="0 0 50 50" fill="none" className={className}>
          <g>
            <circle cx="25" cy="12" r="9" fill="#C7F9CC" stroke="#57CC99" strokeWidth="1" />
            <circle cx="37" cy="21" r="9" fill="#C7F9CC" stroke="#57CC99" strokeWidth="1" />
            <circle cx="33" cy="36" r="9" fill="#C7F9CC" stroke="#57CC99" strokeWidth="1" />
            <circle cx="17" cy="36" r="9" fill="#C7F9CC" stroke="#57CC99" strokeWidth="1" />
            <circle cx="13" cy="21" r="9" fill="#C7F9CC" stroke="#57CC99" strokeWidth="1" />
            <circle cx="25" cy="25" r="10" fill="#80ED99" stroke="#38A3A5" strokeWidth="1.5" />
            <circle cx="21" cy="25" r="2" fill="#22577A" />
            <circle cx="29" cy="25" r="2" fill="#22577A" />
            <line x1="21" y1="25" x2="29" y2="25" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        </svg>
      );

    default:
      return null;
  }
}

function ScreenBorderFrame({ isEnding }: { isEnding?: boolean }) {
  return (
    <div className={`pointer-events-none absolute inset-0 z-30 overflow-hidden transition-all duration-700 ${isEnding ? "opacity-20 scale-[0.99]" : ""}`} aria-hidden="true">
      {/* Dashed Stitched Scrapbook Frame */}
      <div className="absolute inset-5 rounded-3xl border-2 border-dashed border-[#F0A8B8]/40 opacity-45" />
      <div className="absolute inset-7 rounded-2xl border border-rose-300/25 opacity-35" />

      {/* Top Left Corner Scrapbook Cluster */}
      <div className="absolute left-7 top-7 flex items-center gap-2 opacity-50">
        <ScrapbookButton type="red-dot" size={40} className="rotate-[-12deg] drop-shadow-sm" />
        <ScrapbookButton type="yellow-star" size={34} className="rotate-[15deg] -ml-3 drop-shadow-sm" />
        <span className="font-hand text-xs text-[#B85C70]/70 font-bold rotate-[-6deg] ml-1">✦ Secret Scrapbook ✦</span>
      </div>

      {/* Top Right Corner Scrapbook Cluster */}
      <div className="absolute right-7 top-7 flex items-center gap-2 opacity-50">
        <span className="font-hand text-xs text-[#B85C70]/70 font-bold rotate-[4deg] mr-1">LOVE MAIL 💌</span>
        <ScrapbookButton type="apple-gingham" size={40} className="rotate-[10deg] drop-shadow-sm" />
        <ScrapbookButton type="pink-flower" size={36} className="rotate-[-8deg] -ml-3 drop-shadow-sm" />
      </div>

      {/* Bottom Left Corner Scrapbook Cluster */}
      <div className="absolute left-7 bottom-7 flex items-center gap-2 opacity-50">
        <ScrapbookButton type="green-heart" size={38} className="rotate-[18deg] drop-shadow-sm" />
        <ScrapbookButton type="yellow-blue-dot" size={32} className="rotate-[-14deg] -ml-2 drop-shadow-sm" />
        <span className="font-hand text-xs text-[#B85C70]/70 font-bold rotate-[5deg] ml-1">xoxo ♡</span>
      </div>

      {/* Bottom Right Corner Scrapbook Cluster */}
      <div className="absolute right-7 bottom-7 flex items-center gap-2 opacity-50">
        <span className="font-hand text-xs text-[#B85C70]/70 font-bold rotate-[-4deg] mr-1">Made for you ✨</span>
        <ScrapbookButton type="blue-gingham-heart" size={38} className="rotate-[-10deg] drop-shadow-sm" />
        <ScrapbookButton type="lime-flower" size={36} className="rotate-[12deg] -ml-2 drop-shadow-sm" />
      </div>
    </div>
  );
}

function CardBotanicalDetails() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Top-right card decorative button & doodle */}
      <div className="absolute top-[22%] right-[19%] rotate-12 opacity-45">
        <ScrapbookButton type="cream-round" size={34} className="drop-shadow-xs" />
      </div>

      {/* Bottom-left card floral button & doodle */}
      <div className="absolute bottom-[24%] left-[18%] -rotate-12 opacity-45">
        <ScrapbookButton type="pink-floral" size={36} className="drop-shadow-xs" />
      </div>

      {/* Scattered cute scrapbook stars & hearts around card */}
      <span className="absolute top-[28%] left-[25%] text-rose-400/50 text-sm font-hand select-none">💖</span>
      <span className="absolute top-[31%] right-[23%] text-amber-400/50 text-xs font-hand select-none">✨</span>
      <span className="absolute bottom-[29%] left-[27%] text-pink-400/50 text-base font-hand select-none">✦</span>
      <span className="absolute bottom-[26%] right-[26%] text-amber-500/50 text-xs font-hand select-none">✧</span>

      {/* Journal doodles */}
      <span className="absolute top-[18%] left-[30%] text-rose-500/35 text-xs font-hand font-bold select-none rotate-[-8deg]">for my fav brother 🎀</span>
      <span className="absolute bottom-[17%] right-[29%] text-pink-600/35 text-xs font-hand font-bold select-none rotate-[6deg]">don't look! 🙈</span>
    </div>
  );
}

function AmbientDetails({ isEnding }: { isEnding?: boolean }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden transition-all duration-700 ${isEnding ? "opacity-15" : ""}`} aria-hidden="true">
      {/* Additional ambient scrapbook buttons around the background outer margins */}
      <div className="absolute left-[12%] top-[45%] -rotate-45 opacity-40">
        <ScrapbookButton type="yellow-star" size={26} className="drop-shadow-xs" />
      </div>
      <div className="absolute right-[13%] top-[42%] rotate-45 opacity-40">
        <ScrapbookButton type="pink-flower" size={28} className="drop-shadow-xs" />
      </div>
      <div className="absolute left-[15%] bottom-[40%] rotate-12 opacity-35">
        <ScrapbookButton type="green-heart" size={24} className="drop-shadow-xs" />
      </div>
      <div className="absolute right-[16%] bottom-[38%] -rotate-12 opacity-35">
        <ScrapbookButton type="apple-gingham" size={26} className="drop-shadow-xs" />
      </div>

      <div className="absolute left-10 top-10 size-2 rounded-full bg-rose-300/35" />
      <div className="absolute bottom-16 right-24 size-1.5 rounded-full bg-amber-300/40" />
    </div>
  );
}