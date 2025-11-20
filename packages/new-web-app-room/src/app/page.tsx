import Calculator from '@/components/Calculator';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4 transition-colors duration-500">
      <ThemeToggle />
      <Calculator />
    </div>
  );
}


