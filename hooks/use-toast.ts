/**
 * Simple toast hook for notifications
 * TODO: Replace with proper toast library (sonner, react-hot-toast, etc.) in production
 */

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = ({ title, description, variant }: ToastOptions) => {
    const message = description ? `${title}\n${description}` : title;

    if (variant === "destructive") {
      console.error(`🚨 ${message}`);
      // In browser, show native alert
      if (typeof window !== "undefined") {
        alert(`Error: ${message}`);
      }
    } else {
      console.log(`✅ ${message}`);
      // In browser, show native alert (temporary)
      if (typeof window !== "undefined") {
        alert(message);
      }
    }
  };

  return { toast };
}
