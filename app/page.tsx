import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Hero section with minimal centered content */}
      <section className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-xl space-y-8 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              <span className="text-foreground/90">Football tactics</span>
              <br />
              <span className="text-primary">made simple.</span>
            </h1>
            
            <div className="text-md md:text-lg text-muted-foreground">
              <span className="text-highlight">Animate</span>
              <span className="mx-2">•</span>
              <span className="text-primary">Strategize</span>
              <span className="mx-2">•</span>
              <span className="text-success">Win</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 pt-4 justify-center">
            <Button asChild size="lg" className="px-6 group">
              <Link href="/signup">
                Start creating <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="px-6">
              <Link href="/editor">Try demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-muted/30 py-6 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

