import TruthGuardApp from '@/components/TruthGuardApp';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TruthGuard - AI Fact Checker',
  description: 'Input text, URLs, or images to get AI-powered fact-checking results with confidence scores and sources.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen container mx-auto py-8 px-4 flex flex-col items-center bg-gradient-to-br from-background via-secondary/10 to-background">
      <header className="mb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-primary tracking-tight drop-shadow-sm">
          TruthGuard
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mt-3">
          Your AI Watchdog for the Digital Age
        </p>
      </header>
      <TruthGuardApp />
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} TruthGuard. Powered by Advanced AI.</p>
        <p className="mt-1 text-xs">Please verify critical information independently.</p>
      </footer>
    </main>
  );
}
