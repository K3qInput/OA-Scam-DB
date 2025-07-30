import { useState, useEffect, createContext, useContext } from "react";
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";
import { NotificationCard } from "./enhanced-card";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration (default 5 seconds)
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="animate-slide-in-right"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <NotificationCard
            title={notification.title}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );
}

// Quick notification helpers
export const notify = {
  success: (title: string, message: string, options?: Partial<Notification>) => ({
    type: "success" as const,
    title,
    message,
    ...options
  }),
  error: (title: string, message: string, options?: Partial<Notification>) => ({
    type: "error" as const,
    title,
    message,
    ...options
  }),
  warning: (title: string, message: string, options?: Partial<Notification>) => ({
    type: "warning" as const,
    title,
    message,
    ...options
  }),
  info: (title: string, message: string, options?: Partial<Notification>) => ({
    type: "info" as const,
    title,
    message,
    ...options
  })
};