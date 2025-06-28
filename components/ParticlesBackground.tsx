'use client';

import { useCallback, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { useTheme } from "next-themes";

export default function ParticlesBackground() {
  const { theme } = useTheme();
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    if (container) {
      console.log("Particles container loaded");
    }
  }, []);

  if (!init) return null;

  const isDark = theme === "dark";

  return (
    <Particles
      id="tsparticles"
      particlesLoaded={particlesLoaded}
      options={{
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: "push",
            },
            onHover: {
              enable: true,
              mode: "bubble",
            },
          },
          modes: {
            push: {
              quantity: 3,
            },
            bubble: {
              distance: 200,
              duration: 2,
              opacity: 0.8,
              size: 8,
            },
            repulse: {
              distance: 200,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: isDark ? ["#ffffff", "#4f9bff", "#2E7DFF"] : ["#60a5fa", "#3b82f6", "#2563eb"],
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "out",
            },
            speed: 2,
            straight: false,
            attract: {
              enable: true,
              rotate: {
                x: 600,
                y: 1200,
              },
            },
          },
          number: {
            value: 50,
          },
          opacity: {
            value: isDark ? 0.7 : 0.5,
            animation: {
              enable: true,
              speed: 0.5,
              sync: false,
            },
          },
          shape: {
            type: ["circle", "star"],
          },
          size: {
            value: { min: 1, max: 3 },
            animation: {
              enable: true,
              speed: 2,
              sync: false,
            },
          },
          twinkle: {
            particles: {
              enable: true,
              color: isDark ? "#ffffff" : "#60a5fa",
              frequency: 0.05,
              opacity: 1,
            },
          },
          links: {
            color: isDark ? "#ffffff" : "#60a5fa",
            distance: 150,
            enable: true,
            opacity: isDark ? 0.4 : 0.3,
            width: 1,
            triangles: {
              enable: true,
              opacity: 0.05,
            },
          },
        },
        detectRetina: true,
      }}
      className="absolute inset-0 -z-10"
    />
  );
}
