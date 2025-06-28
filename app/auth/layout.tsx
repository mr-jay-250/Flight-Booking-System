import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Flight Booking System',
  description: 'Login or register to book flights on our platform',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        {children}
      </div>
    </div>
  );
}
