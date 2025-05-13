import TruthGuardApp from '@/components/TruthGuardApp';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TruthGuard - AI Fact Checker',
  description: 'Input text, URLs, or images to get AI-powered fact-checking results with confidence scores and sources.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen container mx-auto py-8 px-4 flex flex-col items-center">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-bold text-primary tracking-tight">
          TruthGuard
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Your AI Watchdog for the Digital Age
        </p>
      </header>
      <TruthGuardApp />
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} TruthGuard. Powered by Advanced AI.</p>
      </footer>
    </main>
  );
}
