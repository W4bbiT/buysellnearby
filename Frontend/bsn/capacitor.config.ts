import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.azar.ansar',
  appName: 'BuySellNearby',
  webDir: 'www/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;
