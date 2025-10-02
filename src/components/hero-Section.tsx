import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-balance font-sans text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Streamline Your Projects with TaskFlow
          </h1>
          <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl lg:text-2xl">
            The modern project management tool that helps teams collaborate seamlessly, track progress effortlessly, and
            deliver results faster.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="group w-full sm:w-auto">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
