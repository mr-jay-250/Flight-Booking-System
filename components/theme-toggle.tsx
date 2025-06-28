'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  
  // Only render the toggle after mounting to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  // Render a placeholder with the same dimensions during SSR
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative overflow-hidden rounded-full"
      >
        <div className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="relative overflow-hidden rounded-full"
    >
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {theme === 'dark' ? (
          <Moon className="absolute h-5 w-5" />
        ) : (
          <Sun className="absolute h-5 w-5" />
        )}
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
