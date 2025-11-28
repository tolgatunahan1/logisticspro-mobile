import { firebaseDatabase } from "../constants/firebase";
import { onValue, ref, onDisconnect } from "firebase/database";

export type ConnectionStatus = "connected" | "disconnected" | "checking";

// Global connection state
let connectionStatus: ConnectionStatus = "checking";
let connectionListeners: ((status: ConnectionStatus) => void)[] = [];

/**
 * Monitor Firebase Realtime Database connection state
 */
export function initializeConnectionMonitoring(): void {
  try {
    const connectedRef = ref(firebaseDatabase, ".info/connected");
    
    onValue(connectedRef, (snapshot) => {
      const isConnected = snapshot.val() === true;
      const newStatus: ConnectionStatus = isConnected ? "connected" : "disconnected";
      
      if (newStatus !== connectionStatus) {
        connectionStatus = newStatus;
        notifyListeners(newStatus);
      }
    });
  } catch (error) {
    // Silent fail - connection monitoring is non-critical
    connectionStatus = "disconnected";
  }
}

/**
 * Subscribe to connection status changes
 */
export function onConnectionStatusChange(
  callback: (status: ConnectionStatus) => void
): () => void {
  connectionListeners.push(callback);
  
  // Immediately call with current status
  callback(connectionStatus);
  
  // Return unsubscribe function
  return () => {
    connectionListeners = connectionListeners.filter((cb) => cb !== callback);
  };
}

/**
 * Get current connection status
 */
export function getConnectionStatus(): ConnectionStatus {
  return connectionStatus;
}

/**
 * Notify all listeners of connection status change
 */
function notifyListeners(status: ConnectionStatus): void {
  connectionListeners.forEach((callback) => {
    try {
      callback(status);
    } catch (error) {
      // Silent fail - don't break other listeners
    }
  });
}
