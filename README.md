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


```
studio-1
├─ apphosting.yaml
├─ components.json
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ README.md
├─ src
│  ├─ ai
│  │  ├─ dev.ts
│  │  ├─ flows
│  │  │  └─ lineage-suggestion.ts
│  │  └─ genkit.ts
│  ├─ app
│  │  ├─ (app)
│  │  │  ├─ dashboard
│  │  │  │  └─ page.tsx
│  │  │  ├─ layout.tsx
│  │  │  ├─ projects
│  │  │  │  ├─ new
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ [projectId]
│  │  │  │     └─ page.tsx
│  │  │  └─ settings
│  │  │     └─ page.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ login
│  │  │  └─ page.tsx
│  │  └─ page.tsx
│  ├─ components
│  │  ├─ acquisition
│  │  │  ├─ acquisition-card.tsx
│  │  │  ├─ acquisition-tracker-view.tsx
│  │  │  ├─ edit-acquisition-status-dialog.tsx
│  │  │  └─ site-acquisition-chart.tsx
│  │  ├─ documents
│  │  │  └─ title-documents-view.tsx
│  │  ├─ files
│  │  │  └─ file-manager.tsx
│  │  ├─ layout
│  │  │  └─ app-sidebar.tsx
│  │  ├─ lineage
│  │  │  ├─ lineage-suggestion.tsx
│  │  │  ├─ lineage-view.tsx
│  │  │  └─ person-card.tsx
│  │  ├─ mindmap
│  │  │  └─ mind-map-view.tsx
│  │  ├─ project
│  │  │  ├─ legal-notes.tsx
│  │  │  ├─ notes.tsx
│  │  │  ├─ project-map.tsx
│  │  │  └─ site-sketch-manager.tsx
│  │  ├─ sketch
│  │  │  └─ site-sketch-view.tsx
│  │  ├─ transactions
│  │  │  ├─ advance-payment-grid.tsx
│  │  │  ├─ financial-transactions.tsx
│  │  │  └─ transaction-history.tsx
│  │  └─ ui
│  │     ├─ accordion.tsx
│  │     ├─ alert-dialog.tsx
│  │     ├─ alert.tsx
│  │     ├─ avatar.tsx
│  │     ├─ badge.tsx
│  │     ├─ button.tsx
│  │     ├─ calendar.tsx
│  │     ├─ card.tsx
│  │     ├─ carousel.tsx
│  │     ├─ chart.tsx
│  │     ├─ checkbox.tsx
│  │     ├─ collapsible.tsx
│  │     ├─ dialog.tsx
│  │     ├─ dropdown-menu.tsx
│  │     ├─ form.tsx
│  │     ├─ input.tsx
│  │     ├─ label.tsx
│  │     ├─ menubar.tsx
│  │     ├─ popover.tsx
│  │     ├─ progress.tsx
│  │     ├─ radio-group.tsx
│  │     ├─ scroll-area.tsx
│  │     ├─ select.tsx
│  │     ├─ separator.tsx
│  │     ├─ sheet.tsx
│  │     ├─ sidebar.tsx
│  │     ├─ skeleton.tsx
│  │     ├─ slider.tsx
│  │     ├─ switch.tsx
│  │     ├─ table.tsx
│  │     ├─ tabs.tsx
│  │     ├─ textarea.tsx
│  │     ├─ toast.tsx
│  │     ├─ toaster.tsx
│  │     └─ tooltip.tsx
│  ├─ context
│  │  └─ auth-context.tsx
│  ├─ hooks
│  │  ├─ use-mobile.tsx
│  │  └─ use-toast.ts
│  ├─ lib
│  │  ├─ initial-data.ts
│  │  ├─ project-template.ts
│  │  ├─ road-data.ts
│  │  ├─ site-sketch-data.ts
│  │  └─ utils.ts
│  └─ types
│     ├─ index.ts
│     └─ zod.ts
├─ tailwind.config.ts
├─ tsconfig.json
└─ USER_MANUAL.md

```
 a project has 3 fields  
 1.  project name
 2.  project id (siteid)
 3.  location
  
a project has 1 or more land owners

create land owner as ( Family head)
 1.   name
 2.  age
 3. gender
 4. Status (alive, dead, missing , unknown)
 5. Source of Land 
 Add New Survey Record 
1. Survey/Sub-Div No.
2. Acres 
3. Cents 
4. Classification (wet dry)
 
then further we add  heir  detilas 

1.  name
2.  relation
3.  age
4.  gender 
5. Marital Status  (single, married, divorced, widowed)
 
5. Status (alive, dead, missing , unknow)
6. Source of Land
  
Transaction history 
1. owner ( fmaily head name) 
2. source name
3. Source Mode ( purchase, legal heir, gift, settelment)
4. Year
5. Doc Number 

financial transactions 
1. Amount
2. Date of Payment 
3. Payment Purpose ( token, advance)


title documents 
Revenue Records (upload image)
 SRO Documents (upload image) 

Add Note 
1. Survey Number 
2. Note content 
3. Related URLs

Add Legal Notes 
1. Survey Number 
2. Legal Note Content
