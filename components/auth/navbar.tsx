'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, User, LogOut, Menu, X, Settings } from 'lucide-react';
import { isAdminEmail } from '@/lib/admin-auth';

export default function NavBarNew() {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        type: "spring" as const,
        stiffness: 100,
        damping: 20,
        mass: 1
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring" as const, stiffness: 300, damping: 24 }
    },
    hover: { scale: 1.05, y: -2 }
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1,
        staggerDirection: 1
      }
    }
  };

  const mobileItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  };

  const isAdmin = user && isAdminEmail(user.email);

  return (
    <>
      <motion.nav 
        initial="hidden"
        animate="visible"
        variants={navVariants}
        className={`fixed top-0 left-0 right-0 z-40 w-full backdrop-blur-lg transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 dark:bg-gray-900/90 shadow-md' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <motion.div 
              className="flex-shrink-0 flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <Link href="/" className="flex items-center space-x-2">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, 0, -10, 0],
                    x: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  <Plane className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Flight Booking
                </span>
              </Link>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {!isAdmin && (
                <>
                  <motion.div 
                    variants={itemVariants}
                    whileHover="hover"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Link href="/flights">Flights</Link>
                  </motion.div>
                  <motion.div 
                    variants={itemVariants}
                    whileHover="hover"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Link href="/destinations">Destinations</Link>
                  </motion.div>
                </>
              )}
              <ThemeToggle />
              
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-8 w-24 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse"
                />
              ) : isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {isAdmin && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link href="/admin">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-2 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950 text-purple-600 dark:text-purple-400"
                        >
                          <Settings size={16} />
                          Admin
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/profile">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950"
                      >
                        <User size={16} />
                        Profile
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={logout}
                      className="flex items-center gap-2 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                    >
                      <LogOut size={16} />
                      Logout
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/auth/login">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-blue-300 dark:border-blue-700 hover:border-blue-600"
                      >
                        Login
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/auth/register">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        Register
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-3">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
              className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg"
            >
              <div className="px-4 py-4 space-y-4 divide-y divide-gray-200 dark:divide-gray-800">
                <div className="space-y-3 pt-2 pb-3">
                  {!isAdmin && (
                    <>
                      <motion.div variants={mobileItemVariants}>
                        <Link 
                          href="/flights" 
                          className="block text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Flights
                        </Link>
                      </motion.div>
                      <motion.div variants={mobileItemVariants}>
                        <Link 
                          href="/destinations" 
                          className="block text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Destinations
                        </Link>
                      </motion.div>
                    </>
                  )}
                </div>
                
                {isLoading ? (
                  <motion.div
                    variants={mobileItemVariants}
                    className="py-4 h-10 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"
                  />
                ) : isAuthenticated ? (
                  <div className="py-4 space-y-3">
                    {isAdmin && (
                      <motion.div variants={mobileItemVariants}>
                        <Link 
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400"
                          >
                            <Settings size={16} />
                            Admin Dashboard
                          </Button>
                        </Link>
                      </motion.div>
                    )}
                    <motion.div variants={mobileItemVariants}>
                      <Link 
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <User size={16} />
                          Profile
                        </Button>
                      </Link>
                    </motion.div>
                    <motion.div variants={mobileItemVariants}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 text-rose-600 dark:text-rose-500"
                      >
                        <LogOut size={16} />
                        Logout
                      </Button>
                    </motion.div>
                  </div>
                ) : (
                  <div className="py-4 space-y-3">
                    <motion.div variants={mobileItemVariants}>
                      <Link 
                        href="/auth/login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button 
                          variant="outline" 
                          className="w-full"
                        >
                          Login
                        </Button>
                      </Link>
                    </motion.div>
                    <motion.div variants={mobileItemVariants}>
                      <Link 
                        href="/auth/register"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button 
                          variant="default" 
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500"
                        >
                          Register
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      
      {/* Add a spacer to account for the fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
