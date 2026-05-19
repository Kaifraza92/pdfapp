// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alzuhra.reader',
  appName: 'AL Zuhra Academy Reader',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#064e3b",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
  android: {
    // Note: To fully support opening PDFs from file managers locally, 
    // the true AndroidManifest.xml needs an intent-filter added manually after 'npx cap add android'.
    // <intent-filter>
    //   <action android:name="android.intent.action.VIEW" />
    //   <category android:name="android.intent.category.DEFAULT" />
    //   <category android:name="android.intent.category.BROWSABLE" />
    //   <data android:scheme="file" />
    //   <data android:scheme="content" />
    //   <data android:mimeType="application/pdf" />
    // </intent-filter>
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystoreAlias: 'key0',
    }
  }
};

export default config;
