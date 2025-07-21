
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-800/90 group-[.toaster]:text-white group-[.toaster]:border-cyan-500/30 group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-sm",
          description: "group-[.toast]:text-slate-300",
          actionButton:
            "group-[.toast]:bg-cyan-500 group-[.toast]:text-white group-[.toast]:hover:bg-cyan-600",
          cancelButton:
            "group-[.toast]:bg-slate-700 group-[.toast]:text-slate-300 group-[.toast]:hover:bg-slate-600",
          success: "group-[.toaster]:border-green-500/30 group-[.toaster]:text-green-400",
          error: "group-[.toaster]:border-red-500/30 group-[.toaster]:text-red-400",
          warning: "group-[.toaster]:border-yellow-500/30 group-[.toaster]:text-yellow-400",
          info: "group-[.toaster]:border-blue-500/30 group-[.toaster]:text-blue-400",
        },
      }}
      {...props}
    />
  )
}

// Themed toast helpers
const battleToast = {
  success: (message: string, description?: string) => 
    toast.success(message, { 
      description,
      icon: "🏆"
    }),
  error: (message: string, description?: string) => 
    toast.error(message, { 
      description,
      icon: "⚔️" 
    }),
  loading: (message: string) => 
    toast.loading(message, { 
      icon: "⚡" 
    }),
  info: (message: string, description?: string) => 
    toast.info(message, { 
      description,
      icon: "🎯" 
    })
}

export { Toaster, toast, battleToast }
