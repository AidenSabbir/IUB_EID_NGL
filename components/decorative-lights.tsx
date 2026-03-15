export function DecorativeLights() {
  const numArcs = 8;
  const width = 1200;
  const arcWidth = width / numArcs;

  const arcs = Array.from({ length: numArcs }).map((_, i) => {
    const x0 = i * arcWidth;
    const x1 = x0 + arcWidth;
    const xMid = x0 + arcWidth / 2;
    const yControl = i % 2 === 0 ? 100 : 70;
    
    // Calculate bulbs along the arc at parameter t
    const tValues = [0.15, 0.35, 0.5, 0.65, 0.85];
    const bulbs = tValues.map((t) => {
      // Quadratic bezier curve equations
      const x = Math.pow(1 - t, 2) * x0 + 2 * (1 - t) * t * xMid + Math.pow(t, 2) * x1;
      const y = 2 * (1 - t) * t * yControl; // Simplified since y0 and y2 are 0
      return { x, y };
    });

    return { x0, x1, xMid, yControl, bulbs };
  });

  return (
    <div className="absolute top-16 md:top-0 left-0 w-full overflow-hidden pointer-events-none z-50 opacity-80 h-32 md:h-40">
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="xMidYMin slice"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {arcs.map((arc, i) => (
          <g key={`arc-${i}`}>
            <path
              d={`M ${arc.x0} 0 Q ${arc.xMid} ${arc.yControl} ${arc.x1} 0`}
              fill="none"
              stroke="#52525b"
              strokeWidth="2"
            />
            {arc.bulbs.map((bulb, j) => {
              const isYellow = (i * 5 + j) % 2 === 0;
              return (
                <g key={`bulb-${i}-${j}`}>
                  <rect x={bulb.x - 3} y={bulb.y - 4} width="6" height="6" fill="#3f3f46" rx="1" />
                  <circle
                    cx={bulb.x}
                    cy={bulb.y + 4}
                    r="4.5"
                    fill="currentColor"
                    className={`${
                      isYellow
                        ? "text-yellow-400 dark:text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"
                        : "text-amber-500 dark:text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                    } animate-pulse`}
                    style={{
                      animationDelay: `${(i * 5 + j) * 0.15}s`,
                      animationDuration: isYellow ? "2s" : "2.5s",
                    }}
                  />
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}
