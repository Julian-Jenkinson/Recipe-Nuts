# Recipe Nuts 🥜

Recipe sites often make it cumbersome to save and re-use recipes. Recipe Nuts is a mobile app that lets you easily save and store recipes from the web. No lengthy blog posts, personal backstories or countless open tabs - just the essential recipe details, neatly organized in one place.  

## Features 💥

- Recipe management tool: Import, create, view, edit, delete and share recipes
- Custom built REST Recipe Extractor API
- Built with React Native for both Android and iOS
- Clean intuitive UI


## Technology ✨ 

**Frontend** - React Native, TypeScript, Expo


## Release Scedule 🚀

Currently in closed testing. I am aiming towards a public release in late 2025.


## Post Release Features 📦

- Shopping list
- Meal planner
- Scale ingredients
- Metric & Imperial conversions
- Cook mode toggle
- Dark mode toggle


## Local development 🧑‍🏭

Utilising Expo managed workflow. The following commands will be useful:

   ```bash
   npm install                                                       # Install dependencies
   npx expo start -                                                  # Start the app with clear cache
   emulator -avd Medium_Phone_API_36.0 -wipe-data                    # Wipe android emulator data
   npx expo-doctor
   npx react-native log-android                                      # view logs on connected device
   adb logcat | grep recipenuts                                      # detailed logs
   npx expo prebuild                                                 # (re)builds andoid/ios folders
   eas build --profile preview --platform android                    # Test build preview
   eas build --profile preview --platform android --clear-cache      # Test Preview build with a clean cache
   
   eas build --platfrom android --profile development                # dev build
   eas build --platform android --profile production                 # prod build
   eas build --platform android --profile production --auto-submit   # prod build with auto submit to playstore

   ```









