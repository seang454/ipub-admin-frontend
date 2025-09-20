"use client"
import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { LoadingDots } from "@/components/loading-dots"

export default function LoadingPage() {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = ["Initializing application", "Loading resources", "Preparing interface", "Almost ready"]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 300)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 1500)

    return () => clearInterval(stepInterval)
  }, [steps.length])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo/Brand Area */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center animate-float">
            <div className="w-8 h-8 bg-primary-foreground rounded-lg animate-spin-slow"></div>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2 text-balance">Loading Experience</h1>
          <p className="text-muted-foreground text-pretty">{"Preparing something amazing for you"}</p>
        </div>

        {/* Main Loading Animation */}
        <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
          <div className="flex flex-col items-center gap-6">
            <LoadingSpinner size="lg" className="text-primary" />

            {/* Progress Bar */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium text-foreground">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Current Step */}
            <div className="text-center">
              <p className="text-foreground font-medium mb-2">{steps[currentStep]}</p>
              <LoadingDots />
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">{"This may take a few moments"}</p>
        </div>
      </div>
    </div>
  )
}
