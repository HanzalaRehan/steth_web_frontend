import { Toaster as Sonner } from "sonner"

// Adapted from shadcn/ui's Sonner wrapper: the original reads next-themes'
// current theme, but next-themes isn't used anywhere in this app (the admin
// theme is always dark, no light/dark switcher exists), so this is fixed to
// "dark" instead of wiring up a theme provider for a single fixed value.
const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
