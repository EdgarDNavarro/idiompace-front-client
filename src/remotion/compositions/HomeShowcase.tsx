import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import {
  BookOpen,
  Flame,
  Mic2,
  Users,
  Play,
  Search,
} from "lucide-react";

// Componente de fondo animado con partículas
const AnimatedBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const particles = Array.from({ length: 15 }, (_, i) => i);

  return (
    <div className="absolute inset-0">
      {particles.map((i) => {
        const delay = i * 3;
        const duration = 120 + i * 10;
        const x = (i * 73) % 100;
        const y = (i * 47) % 100;
        const size = 2 + (i % 3);

        const opacity = interpolate(
          (frame - delay) % duration,
          [0, duration / 3, (duration * 2) / 3, duration],
          [0, 0.4, 0.4, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        const posY = interpolate(
          frame - delay,
          [0, duration],
          [0, -30],
          {
            extrapolateRight: "extend",
          }
        );

        return (
          <div
            key={i}
            className="absolute rounded-full bg-green-400"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              opacity,
              transform: `translateY(${posY}px)`,
              filter: "blur(1px)",
            }}
          />
        );
      })}

      {/* Gradientes decorativos */}
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"
        style={{
          transform: `translateY(${interpolate(frame, [0, 300], [0, 50], {
            extrapolateRight: "extend",
          })}px)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
        style={{
          transform: `translateY(${interpolate(frame, [0, 300], [0, -50], {
            extrapolateRight: "extend",
          })}px)`,
        }}
      />
    </div>
  );
};

interface HomeShowcaseProps {
  title: string;
}

export const HomeShowcase: React.FC<HomeShowcaseProps> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Intro Animation - Más dinámica y atractiva
  const introOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const introScale = spring({
    frame: frame,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
      mass: 0.5,
    },
  });

  const introY = interpolate(frame, [0, 40], [-100, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Rotación sutil del logo
  const logoRotate = interpolate(frame, [0, 60], [0, 360], {
    extrapolateRight: "clamp",
  });

  // Pulso del logo
  const logoPulse = interpolate(
    frame % 30,
    [0, 15, 30],
    [1, 1.1, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Brillo del título
  const titleGlow = interpolate(
    frame % 60,
    [0, 30, 60],
    [0, 0.3, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Fade out del intro
  const introFadeOut = interpolate(frame, [70, 90], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill className="bg-neutral-900 relative overflow-hidden">
      {/* Partículas de fondo animadas */}
      <AnimatedBackground frame={frame} />

      {/* Intro Sequence */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill
          className="flex flex-col justify-center items-center z-10"
          style={{
            opacity: introOpacity * introFadeOut,
            transform: `scale(${introScale}) translateY(${introY}px)`,
          }}
        >
          {/* Logo con animación */}
          <div
            className="text-green-500 mb-5 relative"
            style={{
              transform: `rotate(${logoRotate}deg) scale(${logoPulse})`,
            }}
          >
            <div
              className="absolute inset-0 blur-2xl bg-green-500/30"
              style={{
                transform: `scale(${1.5 + logoPulse * 0.5})`,
              }}
            />
            <BookOpen size={80} strokeWidth={2} className="relative z-10" />
          </div>

          {/* Título con efecto glow */}
          <h1
            className="text-6xl font-bold text-gray-100 text-center px-10 relative"
            style={{
              textShadow: `0 0 ${30 * titleGlow}px rgba(16, 185, 129, ${titleGlow})`,
            }}
          >
            {title}
          </h1>

          {/* Subtítulo con delay */}
          <p
            className="text-3xl text-slate-400 text-center mt-5"
            style={{
              opacity: interpolate(frame, [30, 50], [0, 1], {
                extrapolateRight: "clamp",
              }),
              transform: `translateY(${interpolate(frame, [30, 50], [20, 0], {
                extrapolateRight: "clamp",
              })}px)`,
            }}
          >
            Tu app de aprendizaje de idiomas
          </p>

          {/* Línea decorativa animada */}
          <div
            className="h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent mt-8"
            style={{
              width: `${interpolate(frame, [40, 70], [0, 300], {
                extrapolateRight: "clamp",
              })}px`,
            }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Home Interface Sequence */}
      <Sequence from={90} durationInFrames={360}>
        <HomeInterface frame={frame - 90} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};


// Home Interface Component
const HomeInterface: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // Fade in con bounce
  const opacity = spring({
    frame: frame,
    fps,
    from: 0,
    to: 1,
    config: {
      damping: 100,
    },
  });

  // Header con bounce effect
  const headerY = spring({
    frame: frame,
    fps,
    from: -100,
    to: 0,
    config: {
      damping: 80,
      stiffness: 150,
    },
  });

  // Streak counter con efecto dramático
  const streakScale = spring({
    frame: Math.max(0, frame - 10),
    fps,
    from: 0,
    to: 1,
    config: {
      damping: 60,
      stiffness: 200,
    },
  });

  const streakRotate = interpolate(frame, [10, 40], [-5, 0], {
    extrapolateRight: "clamp",
  });

  // Search bar con slide in lateral
  const searchX = spring({
    frame: Math.max(0, frame - 25),
    fps,
    from: 100,
    to: 0,
    config: {
      damping: 80,
    },
  });

  // Stories grid con aparición escalonada
  const storiesOpacity = interpolate(frame, [45, 65], [0, 1], {
    extrapolateRight: "clamp",
  });

  const storiesScale = spring({
    frame: Math.max(0, frame - 45),
    fps,
    from: 0.8,
    to: 1,
    config: {
      damping: 70,
    },
  });

  // Cards individuales con delay
  const card1Delay = 50;
  const card2Delay = 60;
  const card3Delay = 70;
  const card4Delay = 80;
  const card5Delay = 90;
  const card6Delay = 100;

  const card1Y = spring({
    frame: Math.max(0, frame - card1Delay),
    fps,
    from: 50,
    to: 0,
    config: { damping: 80 },
  });

  const card2Y = spring({
    frame: Math.max(0, frame - card2Delay),
    fps,
    from: 50,
    to: 0,
    config: { damping: 80 },
  });

  const card3Y = spring({
    frame: Math.max(0, frame - card3Delay),
    fps,
    from: 50,
    to: 0,
    config: { damping: 80 },
  });

  const card4Y = spring({
    frame: Math.max(0, frame - card4Delay),
    fps,
    from: 50,
    to: 0,
    config: { damping: 80 },
  });

  const card5Y = spring({
    frame: Math.max(0, frame - card5Delay),
    fps,
    from: 50,
    to: 0,
    config: { damping: 80 },
  });

  const card6Y = spring({
    frame: Math.max(0, frame - card6Delay),
    fps,
    from: 50,
    to: 0,
    config: { damping: 80 },
  });

  // Efecto de flotación sutil
  const floatY = interpolate(
    frame % 90,
    [0, 45, 90],
    [0, -5, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const currentStreak = 7;
  const longestStreak = 15;

  return (
    <AbsoluteFill
      className="p-10 bg-neutral-900 overflow-hidden relative"
      style={{ opacity }}
    >
      {/* Header con animación */}
      <div
        className="mb-8 relative"
        style={{
          transform: `translateY(${headerY}px)`,
        }}
      >
        <h1 className="text-4xl font-bold text-gray-100 mb-0 relative">
          English Learning Stories
          {/* Subrayado animado */}
          <div
            className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-green-500 to-green-400 rounded-full"
            style={{
              width: `${interpolate(frame, [15, 35], [0, 100], {
                extrapolateRight: "clamp",
              })}%`,
            }}
          />
        </h1>
      </div>

      {/* Streak Counter con efectos */}
      <div
        className="mb-6 relative"
        style={{
          transform: `scale(${streakScale}) rotate(${streakRotate}deg) translateY(${floatY}px)`,
        }}
      >
        <RealStreakCounter
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          frame={frame}
        />
      </div>

      {/* Search Bar con slide lateral */}
      <div
        className="mb-6"
        style={{
          transform: `translateX(${searchX}px)`,
        }}
      >
        <RealSearchBar frame={frame} />
      </div>

      {/* Stories Grid con fade y scale */}
      <div
        style={{
          opacity: storiesOpacity,
          transform: `scale(${storiesScale})`,
        }}
      >
        <h2
          className="text-3xl font-bold text-gray-100 mb-5 relative"
          style={{
            transform: `translateY(${floatY * 0.5}px)`,
          }}
        >
          Mis Historias
          {/* Icono decorativo animado */}
          <span
            className="ml-3 inline-block text-green-500"
            style={{
              transform: `scale(${1 + Math.sin(frame * 0.1) * 0.1})`,
            }}
          >
            ✨
          </span>
        </h2>
        <div className="grid grid-cols-2 gap-5">
          <div style={{ transform: `translateY(${card1Y}px)` }}>
            <RealStoryCard
              title="The Adventure Begins"
              description="A young explorer discovers an ancient map..."
              categories={["Adventure", "Fantasy"]}
              level="low"
              phrasesCount={25}
              voice="Emma"
              frame={frame - card1Delay}
            />
          </div>
          <div style={{ transform: `translateY(${card2Y}px)` }}>
            <RealStoryCard
              title="City Life"
              description="Daily conversations in a bustling city..."
              categories={["Daily Life"]}
              level="middle"
              phrasesCount={18}
              voice="James"
              frame={frame - card2Delay}
            />
          </div>
          <div style={{ transform: `translateY(${card3Y}px)` }}>
            <RealStoryCard
              title="Business Meeting"
              description="Professional conversations in the workplace..."
              categories={["Business", "Career"]}
              level="middle"
              phrasesCount={22}
              voice="Sarah"
              frame={frame - card3Delay}
            />
          </div>
          <div style={{ transform: `translateY(${card4Y}px)` }}>
            <RealStoryCard
              title="At the Restaurant"
              description="Ordering food and dining experiences..."
              categories={["Food", "Daily Life"]}
              level="low"
              phrasesCount={15}
              voice="Michael"
              frame={frame - card4Delay}
            />
          </div>
          <div style={{ transform: `translateY(${card5Y}px)` }}>
            <RealStoryCard
              title="The Mystery Case"
              description="A detective investigates a puzzling crime..."
              categories={["Mystery", "Thriller"]}
              level="high"
              phrasesCount={30}
              voice="Oliver"
              frame={frame - card5Delay}
            />
          </div>
          <div style={{ transform: `translateY(${card6Y}px)` }}>
            <RealStoryCard
              title="Travel Adventures"
              description="Exploring new countries and cultures..."
              categories={["Travel", "Culture"]}
              level="middle"
              phrasesCount={20}
              voice="Sophie"
              frame={frame - card6Delay}
            />
          </div>
        </div>
      </div>

      {/* Badges flotantes de features */}
      <FloatingFeatures frame={frame} />
    </AbsoluteFill>
  );
};

// Floating Features - Badges animados
const FloatingFeatures: React.FC<{ frame: number }> = ({ frame }) => {
  const features = [
    { icon: BookOpen, text: "100+ Stories", delay: 80, color: "from-green-500 to-emerald-400" },
    { icon: Mic2, text: "Native Voices", delay: 100, color: "from-blue-500 to-cyan-400" },
    { icon: Flame, text: "Daily Streaks", delay: 120, color: "from-orange-500 to-yellow-400" },
  ];

  return (
    <div className="absolute bottom-10 right-10 flex flex-col gap-3">
      {features.map((feature, i) => {
        const opacity = interpolate(frame, [feature.delay, feature.delay + 20], [0, 1], {
          extrapolateRight: "clamp",
        });
        const x = interpolate(frame, [feature.delay, feature.delay + 30], [50, 0], {
          extrapolateRight: "clamp",
        });
        const float = Math.sin((frame + i * 20) * 0.1) * 3;

        return (
          <div
            key={i}
            className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${feature.color} shadow-xl`}
            style={{
              opacity,
              transform: `translateX(${x}px) translateY(${float}px)`,
            }}
          >
            <feature.icon size={20} strokeWidth={2.5} className="text-white" />
            <span className="text-white font-bold text-sm">{feature.text}</span>
          </div>
        );
      })}
    </div>
  );
};

// Real Streak Counter Component
const RealStreakCounter: React.FC<{
  currentStreak: number;
  longestStreak: number;
  frame: number;
}> = ({ currentStreak, longestStreak, frame }) => {
  const accentColor =
    currentStreak >= 30
      ? "#eab308"
      : currentStreak >= 14
      ? "#f97316"
      : currentStreak >= 7
      ? "#10b981"
      : "#10b981";

  const milestones = [7, 14, 30, 60, 100, 200, 365];
  const nextMilestone = milestones.find((m) => m > currentStreak) || null;
  const prevMilestone =
    milestones.filter((m) => m <= currentStreak).slice(-1)[0] || 0;
  const progressToNext = nextMilestone
    ? ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100
    : 100;

  // Animación del progreso suave
  const animatedProgress = spring({
    frame: Math.max(0, frame - 20),
    fps: 30,
    from: 0,
    to: progressToNext,
    config: {
      damping: 100,
    },
  });

  // Pulso del flame icon
  const flamePulse = interpolate(
    frame % 60,
    [0, 30, 60],
    [1, 1.15, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Rotación sutil del glow
  const glowRotate = (frame * 2) % 360;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-400/10 via-green-400/5 to-transparent p-6 shadow-sm ring-1 ring-green-400/20 hover:ring-green-400/40 transition-all">
      {/* Background decoration animada */}
      <div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-green-400/5 blur-2xl"
        style={{
          transform: `rotate(${glowRotate}deg)`,
        }}
      />

      <div className="relative flex gap-6">
        {/* Flame icon con glow y pulso */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-lg animate-pulse"
            style={{
              background: `${accentColor}33`,
              transform: `scale(${flamePulse})`,
            }}
          />
          <div
            className="relative flex items-center justify-center h-16 w-16 rounded-full shadow-lg"
            style={{
              background: `linear-gradient(to bottom right, ${accentColor}, ${accentColor}dd)`,
              transform: `scale(${flamePulse})`,
            }}
          >
            <Flame size={32} strokeWidth={2.5} fill="currentColor" className="text-white" />
          </div>
        </div>

        {/* Streak info */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span
              className="text-5xl font-bold"
              style={{ color: accentColor }}
            >
              {currentStreak}
            </span>
            <span className="text-xl font-medium text-gray-400">
              {currentStreak === 1 ? "día" : "días"}
            </span>
          </div>
          <p className="text-base font-medium text-gray-400 mb-0">
            Racha actual
          </p>

          {longestStreak > 0 && (
            <p className="mt-2 text-sm text-gray-400">
              Mejor racha:{" "}
              <span
                className="font-semibold"
                style={{ color: accentColor }}
              >
                {longestStreak}
              </span>{" "}
              {longestStreak === 1 ? "día" : "días"}
            </p>
          )}
        </div>

        {/* Motivational badge */}
        {currentStreak >= 7 && (
          <div
            className="rounded-lg px-3 py-1.5 h-fit"
            style={{
              border: `1px solid ${accentColor}`,
              color: accentColor,
            }}
          >
            <p className="text-sm font-semibold m-0">¡Genial!</p>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {nextMilestone && (
        <div className="relative mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-green-400/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                background: `linear-gradient(to right, ${accentColor}, ${accentColor}dd)`,
                width: `${animatedProgress}%`,
              }}
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            {nextMilestone - currentStreak}{" "}
            {nextMilestone - currentStreak === 1 ? "día" : "días"} para la
            próxima meta:{" "}
            <span className="font-semibold">{nextMilestone} días</span>
          </p>
        </div>
      )}

      {/* Milestones */}
      <div className="flex gap-2 mt-4 w-full justify-between">
        {milestones.map((m) => (
          <div key={m} className="flex flex-col items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center relative text-xs font-semibold ${
                currentStreak >= m
                  ? "bg-yellow-300 text-red-700"
                  : "bg-neutral-800 text-gray-400"
              }`}
            >
              {currentStreak >= m ? (
                <Flame size={16} strokeWidth={2.5} fill="currentColor" />
              ) : (
                m
              )}
              {currentStreak >= m && (
                <div className="absolute inset-0 rounded-full bg-red-600 blur-xl" />
              )}
            </div>
            <span className="text-xs mt-1 text-gray-400">{m} días</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Real Search Bar Component
const RealSearchBar: React.FC<{ frame: number }> = ({ frame }) => {
  // Animación del botón con pulso
  const buttonScale = interpolate(
    frame % 90,
    [0, 45, 90],
    [1, 1.05, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Brillo del botón
  const buttonGlow = interpolate(
    frame % 60,
    [0, 30, 60],
    [0, 0.3, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <form className="flex flex-wrap gap-4 items-end bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-lg hover:shadow-xl transition-all">
      <div className="flex gap-4 flex-wrap flex-1">
        <div
          style={{
            transform: `translateY(${interpolate(frame, [30, 40], [10, 0], {
              extrapolateRight: "clamp",
            })}px)`,
            opacity: interpolate(frame, [30, 40], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          <label className="block text-xs text-gray-400 mb-1">Idioma</label>
          <div className="px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white hover:border-green-500/50 transition-colors">
            English
          </div>
        </div>
        <div
          className="flex-1 min-w-[200px]"
          style={{
            transform: `translateY(${interpolate(frame, [35, 45], [10, 0], {
              extrapolateRight: "clamp",
            })}px)`,
            opacity: interpolate(frame, [35, 45], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          <label className="block text-xs text-gray-400 mb-1">Título</label>
          <div className="px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-gray-400 w-full hover:border-green-500/50 transition-colors">
            Buscar por título
          </div>
        </div>
        <div
          style={{
            transform: `translateY(${interpolate(frame, [40, 50], [10, 0], {
              extrapolateRight: "clamp",
            })}px)`,
            opacity: interpolate(frame, [40, 50], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          <label className="block text-xs text-gray-400 mb-1">Categoría</label>
          <div className="px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white hover:border-green-500/50 transition-colors">
            Todas
          </div>
        </div>
        <div
          style={{
            transform: `translateY(${interpolate(frame, [45, 55], [10, 0], {
              extrapolateRight: "clamp",
            })}px)`,
            opacity: interpolate(frame, [45, 55], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          <label className="block text-xs text-gray-400 mb-1">Voz</label>
          <div className="px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white hover:border-green-500/50 transition-colors">
            Todas
          </div>
        </div>
      </div>
      <button
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition font-semibold relative overflow-hidden"
        style={{
          transform: `scale(${buttonScale})`,
          boxShadow: `0 0 ${20 * buttonGlow}px rgba(16, 185, 129, ${buttonGlow})`,
        }}
      >
        {/* Brillo animado del botón */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{
            transform: `translateX(${interpolate(frame, [0, 60], [-100, 200], {
              extrapolateRight: "extend",
            })}%)`,
          }}
        />
        <Search size={20} strokeWidth={2.5} className="relative z-10" />
        <span className="relative z-10">Buscar</span>
      </button>
    </form>
  );
};

// Real Story Card Component
const RealStoryCard: React.FC<{
  title: string;
  description: string;
  categories: string[];
  level: string;
  phrasesCount: number;
  voice: string;
  frame: number;
}> = ({ title, description, categories, level, phrasesCount, voice, frame }) => {
  const getLevelStyle = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-500 border-green-500 bg-green-500/10";
      case "middle":
        return "text-yellow-400 border-yellow-400 bg-yellow-400/10";
      case "high":
        return "text-red-400 border-red-400 bg-red-400/10";
      default:
        return "text-gray-500 border-gray-500 bg-gray-500/10";
    }
  };

  // Hover effect simulado
  const hoverEffect = interpolate(
    frame % 120,
    [0, 60, 120],
    [0, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Animación de las categorías
  const categoriesAnimation = (index: number) => {
    const delay = 10 + index * 5;
    return {
      opacity: interpolate(frame, [delay, delay + 15], [0, 1], {
        extrapolateRight: "clamp",
      }),
      transform: `translateX(${interpolate(frame, [delay, delay + 15], [-20, 0], {
        extrapolateRight: "clamp",
      })}px)`,
    };
  };

  return (
    <div
      className="bg-neutral-900 rounded-xl shadow-md border border-neutral-800 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden"

    >
      {/* Brillo animado en hover */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          opacity: hoverEffect * 0.5,
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3
          className="text-xl font-semibold text-white group-hover:text-green-400 transition-colors flex-1"
          style={{
            color: `rgb(255, 255, 255, ${1 - hoverEffect * 0.3})`,
          }}
        >
          {title}
        </h3>
        <div
          className="bg-neutral-800 p-2 rounded-lg group-hover:bg-green-600 transition-all"
        >
          <Play size={20} strokeWidth={2} fill="currentColor" className="text-green-500 group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* Voice */}
      <div className="text-xs text-gray-300 font-medium w-full mb-4 flex items-center gap-1 relative z-10">
        <Mic2
          size={16}
          strokeWidth={2}
          className="text-gray-400"
          style={{
            transform: `rotate(${Math.sin(frame * 0.1) * 5}deg)`,
          }}
        />
        {voice}
      </div>

      {/* Description */}
      <p className="text-gray-400 mb-4 text-sm line-clamp-2 relative z-10">
        {description}
      </p>

      {/* Categories con animación escalonada */}
      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
        {categories.map((cat, idx) => (
          <span
            key={idx}
            className="bg-green-800/30 text-green-300 px-2 py-0.5 rounded-full text-xs font-medium border border-green-700"
            style={categoriesAnimation(idx)}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <BookOpen size={16} strokeWidth={2} className="text-gray-400" />
            <span>English</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} strokeWidth={2} className="text-gray-400" />
            <span>{phrasesCount} phrases</span>
          </div>
        </div>

        <div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getLevelStyle(
              level
            )} transition-all`}
            style={{
              transform: `scale(${1 + hoverEffect * 0.1})`,
            }}
          >
            {level}
          </span>
        </div>
      </div>

      {/* Efecto de borde brillante */}
      <div
        className="absolute inset-0 rounded-xl border-2 border-green-500/0 group-hover:border-green-500/30 transition-all"
        style={{
          borderColor: `rgba(16, 185, 129, ${hoverEffect * 0.3})`,
        }}
      />
    </div>
  );
};
