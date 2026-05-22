import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center max-w-md"
      >
        {/* Casa com ? */}
        <div className="mb-8 flex justify-center">
          <svg viewBox="0 0 200 180" className="w-48 h-48" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Terreno */}
            <rect x="20" y="158" width="160" height="10" rx="3" className="fill-muted" />
            {/* Fundação */}
            <rect x="45" y="140" width="110" height="18" rx="2" className="fill-stone-400/60 dark:fill-stone-600/60" />
            {/* Paredes */}
            <rect x="52" y="90" width="96" height="50" rx="2" className="fill-orange-100 dark:fill-orange-900/30" />
            {/* Telhado */}
            <path d="M35 90 L100 38 L165 90 Z" className="fill-red-600/70 dark:fill-red-800/70" />
            {/* Porta */}
            <rect x="85" y="112" width="30" height="28" rx="3 3 0 0" className="fill-amber-800/70" />
            {/* Janela esquerda */}
            <rect x="58" y="98" width="24" height="20" rx="2" className="fill-sky-200/80 dark:fill-sky-900/50" />
            {/* Janela direita */}
            <rect x="118" y="98" width="24" height="20" rx="2" className="fill-sky-200/80 dark:fill-sky-900/50" />
            {/* Ponto de interrogação */}
            <circle cx="100" cy="64" r="18" className="fill-primary" />
            <text x="100" y="71" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="sans-serif">?</text>
          </svg>
        </div>

        <h1 className="text-8xl font-extrabold text-primary mb-2">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-3">Página não encontrada</h2>
        <p className="text-muted-foreground mb-8">
          A página que você está procurando não existe ou foi removida.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button size="lg" className="w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />Voltar ao início
            </Button>
          </Link>
          <Link to="/app">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />Ir para o app
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
