'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, useScroll } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Plane, 
  Clock, 
  CreditCard, 
  Smartphone, 
  Search, 
  CheckSquare, 
  Settings,
  ArrowDown
} from 'lucide-react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 10
    }
  }
};

const featureVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  show: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring" as const, 
      duration: 0.5 
    }
  },
  hover: { 
    scale: 1.05,
    boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.12)",
    transition: { 
      type: "spring" as const, 
      stiffness: 300, 
      damping: 10 
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: "easeOut" as const
    }
  }
};

export default function Home() {
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const scrollToSearch = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section with Background */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Layers */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/95 via-blue-700/95 to-gray-900/95 dark:from-blue-800/95 dark:via-blue-900/95 dark:to-gray-950/95 z-0" />
          
          {/* Modern abstract elements */}
          <motion.div 
            className="absolute w-[800px] h-[800px] bg-gradient-radial from-blue-400/20 via-transparent to-transparent rounded-full blur-3xl z-10"
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 20,
              ease: "easeInOut"
            }}
            style={{
              top: '-10%',
              left: '-10%'
            }}
          />
          <motion.div 
            className="absolute w-[600px] h-[600px] bg-gradient-radial from-sky-300/20 via-transparent to-transparent rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 15,
              ease: "easeInOut"
            }}
            style={{
              top: '30%',
              right: '-10%'
            }}
          />
          
          {/* Subtle overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30 dark:via-black/40 dark:to-black/60 z-20" />
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 py-16 relative z-30">
          <motion.div 
            className="flex flex-col items-center text-center max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div 
              className="space-y-2 mb-6"
              variants={itemVariants}
            >
              <motion.span 
                className="inline-block text-sm sm:text-base uppercase tracking-wider font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-sky-200 dark:from-blue-300 dark:to-sky-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Welcome to the Future of Travel
              </motion.span>
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight"
                variants={itemVariants}
              >
                <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-sky-200 dark:from-white dark:via-blue-100 dark:to-blue-200">
                  Book Your Perfect
                </span>
                <br />
                <span className="inline-block mt-2 bg-gradient-to-r from-white to-blue-100 dark:from-white dark:to-blue-200 bg-clip-text text-transparent drop-shadow-2xl">
                  Flight in Seconds
                </span>
              </motion.h1>
            </motion.div>
            
            <motion.p 
              className="text-xl sm:text-2xl md:text-3xl text-blue-100/90 dark:text-blue-100/80 max-w-3xl mb-12 font-light leading-relaxed"
              variants={itemVariants}
            >
              Experience seamless travel booking with 
              <span className="font-medium text-white dark:text-white">real-time updates</span>
              {" "}and 
              <span className="font-medium text-white dark:text-white">best price guarantees</span>.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 items-center justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={scrollToSearch}
                  size="lg" 
                  className="relative px-10 py-6 text-lg bg-white dark:bg-white hover:bg-blue-50 dark:hover:bg-blue-50 text-blue-600 dark:text-blue-600 shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.3)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.1)] border-0 transition-all duration-300 overflow-hidden group font-semibold"
                >
                  <span className="relative z-10 flex items-center">
                    Search Flights
                    <ArrowDown className="ml-2 h-5 w-5 inline-block relative z-10 animate-bounce" />
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white dark:from-blue-50 dark:to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => {}}
                  size="lg" 
                  variant="outline"
                  className="px-10 py-6 text-lg border-2 border-black dark:border-white text-black dark:text-white font-semibold bg-white/80 dark:bg-white/20 hover:bg-white/90 dark:hover:bg-white/30 transition-all duration-300 shadow-lg backdrop-blur-smpx-10 py-6 text-lg border-2 border-white text-white font-semibold bg-white/20 hover:bg-white/30 transition-all duration-300 shadow-lg backdrop-blur-sm"
                >
                  View Special Offers
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Transition to next section */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white dark:from-gray-950 to-transparent z-30" />
      </section>

      {/* Features Section */}
      <section ref={searchSectionRef} className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Features That Make Us Different
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience the best in flight booking with our powerful features designed for travelers like you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <motion.div 
              className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800/50 dark:to-gray-900/50 p-6 rounded-xl shadow-lg hover:shadow-xl border border-gray-100/50 dark:border-gray-700/50 backdrop-blur-sm h-full"
              variants={featureVariants}
              initial="hidden"
              whileInView="show"
              whileHover="hover"
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.div 
                className="rounded-xl bg-blue-100/90 dark:bg-blue-900/50 p-5 mb-5 w-16 h-16 flex items-center justify-center shadow-inner"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                <Plane className="h-8 w-8 text-blue-600 dark:text-blue-300" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-50">
                One-Way & Round-Trip Bookings
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Flexible booking options for all your travel needs, with competitive prices and multiple airlines.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 h-full"
              variants={featureVariants}
              initial="hidden"
              whileInView="show"
              whileHover="hover"
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.div 
                className="rounded-xl bg-blue-100/80 dark:bg-blue-900/30 p-5 mb-5 w-16 h-16 flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                Real-Time Flight Status Updates
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Stay informed with instant notifications about gate changes, delays, or cancellations.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 h-full"
              variants={featureVariants}
              initial="hidden"
              whileInView="show"
              whileHover="hover"
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.div 
                className="rounded-xl bg-blue-100/80 dark:bg-blue-900/30 p-5 mb-5 w-16 h-16 flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                Secure Payment & E-Tickets
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Industry-standard encryption for safe transactions and instant e-ticket generation after payment.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 h-full"
              variants={featureVariants}
              initial="hidden"
              whileInView="show"
              whileHover="hover"
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.div 
                className="rounded-xl bg-blue-100/80 dark:bg-blue-900/30 p-5 mb-5 w-16 h-16 flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                <Smartphone className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                Mobile-Friendly & Reliable
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Book and manage your flights on any device, anytime, anywhere with our responsive platform.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-gray-900/50 dark:via-gray-950 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              How It Works
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-200 max-w-2xl mx-auto">
              Three simple steps to get you flying to your destination with ease and confidence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <motion.div 
              className="flex flex-col items-center text-center relative z-10"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center shadow-md mb-6 border-2 border-blue-500">
                <Search className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="absolute -top-3 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Step 1
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                Search Flights
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-xs mx-auto">
                Enter your departure and arrival destinations, dates, and preferences to find the perfect flight.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              className="flex flex-col items-center text-center relative z-10"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center shadow-md mb-6 border-2 border-blue-500">
                <CheckSquare className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="absolute -top-3 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Step 2
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                Book & Pay Securely
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-xs mx-auto">
                Choose your preferred flight, enter passenger details, and complete payment securely.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              className="flex flex-col items-center text-center relative z-10"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center shadow-md mb-6 border-2 border-blue-500">
                <Settings className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="absolute -top-3 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Step 3
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                Manage Your Bookings Easily
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-xs mx-auto">
                Access e-tickets, make changes to your booking, or check flight status through your account dashboard.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="pt-20 pb-16 relative overflow-hidden">
        {/* Theme-specific backgrounds */}
        <div className="absolute inset-0">
          {/* Light theme background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 opacity-100 dark:opacity-0 transition-opacity duration-300" />
          {/* Dark theme background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900 opacity-0 dark:opacity-100 transition-opacity duration-300" />
        </div>
        
        {/* Decorative elements - Light theme */}
        <div className="absolute inset-0 dark:opacity-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-300/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-300/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        {/* Decorative elements - Dark theme */}
        <div className="absolute inset-0 opacity-0 dark:opacity-100">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-900/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-900/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        {/* Animated elements - Light theme */}
        <motion.div 
          className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-3xl bg-sky-300/30 dark:opacity-0"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl bg-indigo-300/30 dark:opacity-0"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
            delay: 1
          }}
        />

        {/* Animated elements - Dark theme */}
        <motion.div 
          className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-3xl opacity-0 dark:opacity-100 bg-blue-800/30"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -180, -360]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-0 dark:opacity-100 bg-slate-700/30"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [-360, -180, 0]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 
              className="text-3xl md:text-5xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ready to Take Off?
            </motion.h2>
            
            <motion.p 
              className="text-xl text-white/90 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Join thousands of happy travelers who book with us every day.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={()=>router.push('/search')}
                  size="lg" 
                  className="px-10 py-6 text-lg bg-white hover:bg-blue-50 text-blue-600 shadow-lg hover:shadow-[0_10px_30px_rgba(255,255,255,0.3)] transition-all duration-300"
                >
                  Search Flights Now
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
