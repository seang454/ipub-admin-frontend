import { CheckCircle2, Users, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Experience blazing-fast performance with real-time updates and instant synchronization across all your devices.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Work together seamlessly with built-in chat, file sharing, and collaborative task management features.",
  },
  {
    icon: CheckCircle2,
    title: "Smart Automation",
    description: "Automate repetitive tasks and workflows to save time and focus on what matters most to your team.",
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-muted/50 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Everything You Need to Succeed
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            Powerful features designed to help your team work smarter, not harder.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border bg-card transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
