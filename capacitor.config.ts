import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.novyn.app',
  appName: 'Novyn',
  webDir: 'public',
  bundledWebRuntime: false,
  server: {
    url: 'http://localhost:3000',  // Local dev server for Android emulator
    cleartext: true  // Allow HTTP for dev
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#F7F9FC',
      overlaysWebView: false
    },
    SplashScreen: {
      launchShowDuration: 900,
      launchAutoHide: true,
      backgroundColor: '#F7F9FC',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP'
    },
    Camera: {
      // Native camera permissions handled automatically
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert", "vibration"],
      android: {
        channelId: 'novyn-chat',
        channelName: 'Novyn Notifications',
        channelDescription: 'Chat notifications',
        importance: 4,  // High priority
        visibility: 1   // Public
      }
    },
    Keyboard: {
      resize: 'native'
    }
  },
  android: {
    allowMixedContent: true,  // For dev HTTP
    permissions: [
      'CAMERA',
      'RECORD_AUDIO',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'POST_NOTIFICATIONS'  // Android 13+
    ]
  }
};

export default config;

