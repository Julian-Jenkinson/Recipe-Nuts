import { execSync } from "child_process";

function getCommitCount() {
  try {
    return execSync("git rev-list --count HEAD").toString().trim();
  } catch {
    return "0";
  }
}

export default () => {
  const commitCount = getCommitCount();

  return {
    "expo": {
      "name": "Recipe Nuts",
      "slug": "recipenuts",
      "version": "1.0.2",
      "orientation": "portrait",
      "icon": "./assets/images/icon.png",
      "scheme": "recipenuts",
      "deepLinking": {
        "enabled": true,
        "autoVerify": true
      },
      "permissions": [],
      "userInterfaceStyle": "automatic",
      "newArchEnabled": true,
      "ios": {
        "supportsTablet": true,
        "bundleIdentifier": "com.hulio.recipenuts"
      },
      "android": {
        "intentFilters": [
          {
            "action": "VIEW",
            "data": {
              "scheme": "recipenuts"
            },
            "category": ["BROWSABLE", "DEFAULT"]
          }
        ],
        "adaptiveIcon": {
          "foregroundImage": "./assets/images/adaptive-icon.png",
          "backgroundColor": "#ffffff"
        },
        "edgeToEdgeEnabled": true,
        "package": "com.hulio.recipenuts",
        "permissions": ["BILLING"],
        "enableProguardInReleaseBuilds": true,
        "proguardRules": "./proguard-rules.pro"
      },
      "web": {
        "bundler": "metro",
        "output": "static",
        "favicon": "./assets/images/favicon.png"
      },
      "plugins": [
        "expo-router",
        [
          "expo-splash-screen",
          {
            "image": "./assets/images/splash-icon.png",
            "imageWidth": 150,
            "resizeMode": "contain",
            "backgroundColor": "#ffffff"
          }
        ],
        ["react-native-edge-to-edge", {
          "android": {
            "parentTheme": "Default",
            "enforceNavigationBarContrast": false
          }
        }],
        
        "expo-font",
        "expo-web-browser"
      ],
      "experiments": {
        "typedRoutes": true
      },
      "extra": {
        "router": {},
        "eas": {
          "projectId": "237e40d5-ae96-43b5-ad01-03847fc7e761"
        },
        commitCount
      },
      "assetBundlePatterns": [
        "**/*"
      ]
    }
  };
};
