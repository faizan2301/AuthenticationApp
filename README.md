# Authentication App

A beautiful and modern React Native app that lets you sign up, log in, and manage your account. Everything is stored securely on your device, so you stay logged in even after closing the app.

## What This App Does

This is a complete authentication app with a polished interface. You can:

- **Create an account** - Sign up with your name, email, and password
- **Log in** - Access your account with your credentials
- **Stay logged in** - The app remembers you, so you don't have to log in every time
- **View your profile** - See your account information on the home screen
- **Log out** - Sign out whenever you want

## Features You'll Love

✨ **Beautiful Design** - Modern, clean interface with smooth animations  
🔐 **Secure Storage** - Your data is stored safely on your device  
👁️ **Password Visibility** - Toggle to show or hide your password while typing  
✅ **Smart Validation** - The app checks your input and shows helpful error messages  
🎨 **Splash Screen** - Beautiful animated welcome screen when you open the app  
📱 **Smooth Navigation** - Easy movement between screens  

## Getting Started

### What You Need

Before you start, make sure you have:

- **Node.js** version 20 or higher installed
- **React Native** development environment set up
- An **iOS Simulator** (if you're on Mac) or **Android Emulator**

### Step-by-Step Setup

1. **Install all the required packages:**
   ```bash
   npm install
   ```

2. **If you're on Mac and want to run on iOS:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run the app:**
   - For **iOS**: Open a new terminal and run `npm run ios`
   - For **Android**: Open a new terminal and run `npm run android`

That's it! The app should launch on your simulator or emulator.

## How to Use the App

### Creating an Account

1. When you first open the app, you'll see the login screen
2. Tap on "Sign Up" at the bottom
3. Enter your full name
4. Enter your email address
5. Create a password (at least 6 characters)
6. Tap the eye icon to show/hide your password while typing
7. Tap "Create Account" to finish

### Logging In

1. Enter your email address
2. Enter your password
3. Tap the eye icon if you want to see your password
4. Tap "Sign In"
5. If your credentials are correct, you'll be taken to your home screen

### Home Screen

Once you're logged in, you'll see:
- Your profile information (name and email)
- Account status indicators
- A logout button at the bottom

### Logging Out

Simply tap the "Sign Out" button on the home screen, and you'll be returned to the login screen.

## Input Requirements

The app checks your input to make sure everything is correct:

**For Sign Up:**
- Name: Can't be empty
- Email: Must be a valid email format (like `yourname@example.com`)
- Password: Must be at least 6 characters long

**For Log In:**
- Email: Must be a valid email format
- Password: Can't be empty

If something's wrong, you'll see a helpful error message telling you what to fix.

## How It Works Behind the Scenes

- **Storage**: The app uses MMKV, which is super fast and keeps your login information safe on your device
- **Navigation**: Built with React Navigation, so moving between screens feels smooth and natural
- **State Management**: Uses React's built-in Context API to manage your login status throughout the app
- **Validation**: Smart checks ensure your information is entered correctly before submitting

## Important Notes

- This is a demo app, so all data is stored locally on your device (not on a server)
- For demonstration purposes, passwords are stored in plain text. In a real app, they would be encrypted
- The app automatically shows the right screen based on whether you're logged in or not

## Troubleshooting

**App won't start?**
- Make sure you've run `npm install` first
- For iOS, make sure you ran `pod install` in the ios folder
- Try clearing the cache: `npm start --reset-cache`

**Can't see the app on my device?**
- Make sure your simulator/emulator is running
- Check that Metro bundler is running (you should see it in the terminal)

**Something's not working?**
- Try stopping Metro bundler (Ctrl+C) and starting it again with `npm start`
- For Android, try: `cd android && ./gradlew clean && cd .. && npm run android`
- For iOS, try: `cd ios && rm -rf build && pod install && cd .. && npm run ios`

## Project Structure

The code is organized in a clean, easy-to-understand way:

```
src/
├── screens/          # All the screens you see (Login, Signup, Home, Splash)
├── assets/           # All the assets stored like images
├── context/          # Manages your login state
├── services/          # Handles saving and loading data
├── utils/            # Helper functions for validation
├── constants/        # Shared constants
└── navigation/       # Controls screen navigation
```


---

