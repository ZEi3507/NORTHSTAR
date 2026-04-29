import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.northstar.conductor',
  appName: 'NorthStar',
  webDir: 'dist',
  server: {
    // Required for Firebase Auth to persist sessions across app restarts
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      backgroundColor: '#0F0E0D',
      style: 'DARK', // light icons on dark background
      overlaysWebView: false,
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      launchFadeOutDuration: 400,
      backgroundColor: '#0F0E0D',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
