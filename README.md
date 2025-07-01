# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Setting up Google Maps

The project dashboard includes a map feature to visualize project locations. To enable this, you need to provide a Google Maps API key.

1.  **Get an API Key**: If you don't have one, create a project in the [Google Cloud Console](https://console.cloud.google.com/) and enable the "Maps JavaScript API". Then, create an API key.
2.  **Update Environment File**: Open the `.env` file in the root of this project.
3.  **Add Your Key**: Find the line that starts with `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and paste your key inside the quotes.

## Deploying and Adding a Custom Domain

Your application is hosted using **Firebase App Hosting**. To connect your custom domain (e.g., `https://lakshmibalajio2o.com/`), follow these steps in the Firebase Console:

1.  **Go to the Firebase Console:** [https://console.firebase.google.com/](https://console.firebase.google.com/)
2.  **Select your project:** `lakshmibalajio2o`
3.  **Navigate to App Hosting:** In the left-hand menu, under the "Build" section, click on **App Hosting**.
4.  **Select your Backend:** You will see a list of backends. Click on the one named **"Studio"**. This should take you to that backend's specific dashboard.
5.  **Add Domain:** On the dashboard, find and click the **Domains** tab.
6.  **Follow Instructions:** Click **"Add custom domain"** and follow the on-screen instructions to verify your domain ownership and update your DNS records.

If you have trouble with the console UI (e.g., pages not loading or cards not being clickable), please try a hard refresh (`Ctrl/Cmd + Shift + R`) or logging out and back in, as this can often resolve temporary issues.
