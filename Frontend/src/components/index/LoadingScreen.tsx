
import { Loader } from "@/components/ui/loader"
import { Sword, Zap } from "lucide-react"

interface LoadingScreenProps {
  message?: string
  variant?: "default" | "battle"
}

const LoadingScreen = ({ message = "Loading...", variant = "default" }: LoadingScreenProps) => {
  if (variant === "battle") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <Sword className="h-16 w-16 text-cyan-400 mx-auto animate-pulse" />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <Loader variant="battle" size="lg" className="mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Entering Battle Arena
            </h2>
            <p className="text-slate-300">{message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader size="lg" className="mx-auto" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export { LoadingScreen }
