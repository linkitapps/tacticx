# Implementation plan

## Phase 1: Environment Setup

1.  **Install Node.js**

    *   Check if Node.js is installed by running `node -v`.
    *   If not installed, install Node.js v20.2.1 as required by the Tech Stack.
    *   **Reference:** Project Overview: Tools

2.  **Initialize Project Directory**

    *   Create a new folder named `/tacticx-app` and inside it, create directories as follows:

        *   `/public`
        *   `/src/app`
        *   `/src/components`
        *   `/src/lib`
        *   `/src/store`
        *   `/src/api`

    *   **Reference:** Project Overview: Folder Structure

3.  **Initialize Git Repository**

    *   In the `/tacticx-app` directory, run `git init` and create `main` and `dev` branches. Enable branch protection rules in your GitHub repository.
    *   **Reference:** Project Overview: Roadmap

4.  **Validation Step**

    *   Run `node -v` to ensure Node.js v20.2.1 is installed.
    *   Verify that the folder structure matches the prescribed layout.

## Phase 2: Frontend Development

1.  **Initialize Next.js Application**

    *   Use Next.js 14 (explicitly chosen for compatibility with AI coding tools) by running:

    `npx create-next-app@14 tacticx-app --experimental-app`

    *   **Reference:** Tech Stack: Frontend

2.  **Install Frontend Dependencies**

    *   Navigate to the project directory and install the required packages:

    `npm install tailwindcss shadcn/ui zustand react-hook-form react-toastify lucide-react`

    *   **Reference:** Tech Stack: Frontend

3.  **Set Up TailwindCSS**

    *   Create a `tailwind.config.js` file in the root directory with dark mode enabled (using the `class` strategy) and include the custom theme with these colors and fonts:

        *   Tactical Orange: `#FF6B00`
        *   Dark Mode Gray: `#1E1E1E`
        *   Dark Mode Gray Lighter: `#252525`
        *   Sharp White: `#F5F5F5`
        *   Highlight Neon: `#00D4FF`
        *   Dynamic Green: `#00FF7F`

    *   Set the fonts: Sora for the app name, Satoshi for headers, and Manrope for body text.

    *   **Reference:** Project Overview: Branding

4.  **Configure Global CSS**

    *   In `/src/app/globals.css`, import TailwindCSS base, components, and utilities:

    `@tailwind base; @tailwind components; @tailwind utilities;`

    *   **Reference:** Tech Stack: Frontend

5.  **Create Landing Page**

    *   Create the landing page file at `/src/app/page.tsx` that contains an overview of Tacticx.app, featuring call-to-action buttons (e.g., Sign Up, Try Demo) that use the branding style.
    *   **Reference:** Project Overview: Pages & Components – Landing Page

6.  **Create Tactical Board Editor Page**

    *   Create `/src/app/editor/page.tsx` that implements the tactical board editor with drag-and-drop functionality for players, formation presets, arrows, text annotations, undo/redo, and saving tactics.
    *   **Reference:** Project Overview: Pages & Components – Editor Page

7.  **Create Tactic Viewer Page**

    *   Create `/src/app/tactic/[id].tsx` for a read-only display of tactics with formations, annotations, and share buttons.
    *   **Reference:** Project Overview: Pages & Components – Viewer Page

8.  **Create User Profile Page**

    *   Create `/src/app/profile/[username].tsx` that displays a user's profile including avatar, bio, coaching credentials, and saved tactics.
    *   **Reference:** Project Overview: Pages & Components – Profile Page

9.  **Create Dashboard Page**

    *   Create `/src/app/dashboard/page.tsx` to list saved tactics for authenticated users, provide a button to create new tactics, and manage shared tactics.
    *   **Reference:** Project Overview: Pages & Components – Dashboard

10. **Develop Reusable UI Components**

    *   In `/src/components/`, create reusable components (e.g., Button, Input, Modal) that follow the dark mode-first design with Tactical Orange accents and neon highlights.
    *   **Reference:** Project Overview: Pages & Components

11. **Set Up Global State Management**

    *   Initialize a Zustand store in `/src/store/` (for example, create a file `useAuthStore.ts` for user authentication state and another store for tactic management).
    *   **Reference:** Tech Stack: Frontend

12. **Integrate Toast Notifications**

    *   In `/src/app/layout.tsx`, import and add the `<ToastContainer />` from React Toastify to ensure notifications are available globally.
    *   **Reference:** Project Overview: Error Handling & Notifications

13. **Validation Step**

    *   Run the development server using `npm run dev` and verify that all pages (Landing, Editor, Viewer, Profile, Dashboard) render correctly and the UI aligns with the branding guidelines.

## Phase 3: Backend Development

1.  **Prepare SQL Migration Script**

    *   Create the migration file at `/supabase/migrations/001_create_tables.sql` to define the database schema.
    *   **Reference:** Project Overview: Core Features – Database

2.  **Create Users Table**

    *   In the migration script, write SQL commands to create the `Users` table with columns:

        *   `id` (UUID, primary key)
        *   `email`
        *   `name`
        *   `profile_picture`
        *   `bio` (optional)
        *   `social_links`

    *   **Reference:** Project Overview: Core Features – Database

3.  **Create Tactics Table**

    *   In the migration script, write SQL commands to create the `Tactics` table with columns:

        *   `id` (UUID, primary key)
        *   `title`
        *   `pitch_data` (JSONB for future animation support)
        *   `visibility` (public/private)
        *   Timestamps (`created_at`, `updated_at`)

    *   **Reference:** Project Overview: Core Features – Database

4.  **Create Sharing Table**

    *   In the migration script, write SQL to create the `Sharing` table with columns for `tactic_id`, `user_id`, and `permissions` (private, public, or user-specific).
    *   **Reference:** Project Overview: Core Features – Database

5.  **Deploy Migration to Supabase**

    *   Set the Supabase connection credentials in the `.env.local` file.
    *   Deploy the migration script to your Supabase Postgres instance via the Supabase dashboard or CLI tool.
    *   **Reference:** Tech Stack: Backend

6.  **Configure Row Level Security (RLS)**

    *   In Supabase, set up RLS policies on the `Users`, `Tactics`, and `Sharing` tables to ensure users can only access their own data.
    *   **Reference:** Project Overview: Additional Security Requirements

7.  **Set Up Supabase Storage**

    *   Configure Supabase Storage for profile picture uploads and other media, and link it with your database entries.
    *   **Reference:** Tech Stack: Backend

8.  **Validation Step**

    *   Log in to the Supabase dashboard and verify that the tables are created correctly and that RLS policies are active by running test queries.

## Phase 4: Integration

1.  **Initialize Supabase Client**

    *   Create a file `/src/lib/supabaseClient.ts` to initialize the Supabase client using the URL and key from environment variables:

    `import { createClient } from '@supabase/supabase-js'; const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!; const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; export const supabase = createClient(supabaseUrl, supabaseKey);`

    *   **Reference:** Tech Stack: Backend

2.  **Integrate User Authentication**

    *   In your login and signup components (which you can place in `/src/components/`), integrate Supabase Auth methods for email/password and Google OAuth.
    *   **Reference:** Project Overview: Core Features – User Authentication

3.  **Connect Tactical Board Editor to Database**

    *   In `/src/app/editor/page.tsx`, implement functions that use the Supabase client to save and retrieve tactics (using the formatted JSONB structure).
    *   **Reference:** Project Overview: Core Features – Tactical Board

4.  **Set Up Shareable Tactic Links**

    *   In the tactic viewer page `/src/app/tactic/[id].tsx`, enable fetching tactic data by UUID and generate social sharing metadata (OpenGraph, Twitter Cards, LinkedIn).
    *   **Reference:** Project Overview: Core Features – Sharing & Accessibility

5.  **Link Dashboard to User Data**

    *   In `/src/app/dashboard/page.tsx`, use the Supabase client to fetch and list the authenticated user's saved tactics.
    *   **Reference:** Project Overview: Pages & Components – Dashboard

6.  **Validation Step**

    *   Test the full user flow: sign up, log in, create and save a tactic, view the tactic via a shareable URL, and verify that dashboard correctly displays saved data.

## Phase 5: Deployment

1.  **Configure GitHub Actions for CI/CD**

    *   Create a GitHub Actions workflow file at `/github/workflows/deploy.yml` that builds and deploys the Next.js app to Vercel upon merging changes into the `main` branch.
    *   **Reference:** Tech Stack: Deployment & DevOps

2.  **Set Environment Variables in Vercel**

    *   In Vercel, configure the project to use the `.env.local` variables for Supabase URL, Supabase Anon Key, and any other secrets.
    *   **Reference:** Tech Stack: Deployment & DevOps

3.  **Deploy to Vercel**

    *   Link your GitHub repository to Vercel and deploy the application.
    *   **Reference:** Project Overview: Roadmap

4.  **Set Up Analytics and Monitoring**

    *   Integrate Vercel Analytics and Supabase logging (via Supabase logs) for monitoring application performance and user activities.
    *   **Reference:** Tech Stack: Deployment & DevOps

5.  **Validation Step**

    *   After deployment, access the live URL and execute critical user actions (sign up, tactic creation, viewing a tactic) to ensure all flows work in production.

## Phase 6: Enhanced Tactical Board Features

1. **Improved Player Markers**

   * Enhance the `PlayerMarker` component (`/components/editor/player-marker.tsx`) to support direct color updates without unnecessary DOM manipulation.
   * Improve the selection and hover states for better visual feedback.
   * Ensure player positioning and dragging are reliable across different devices.
   * **Reference:** Core Features - Tactical Board Editor

2. **Advanced Arrow System**

   * Refine the arrow creation and editing system in `tactical-board.tsx` to support multiple arrow styles (solid, dashed, dotted).
   * Implement proper arrow width control and color selection.
   * Create the `ArrowPath` component to handle arrow rendering and interaction.
   * Add markers that scale proportionally with arrow width.
   * **Reference:** Core Features - Tactical Board Editor

3. **Consolidated Properties Panel**

   * Create a unified properties panel (`/components/editor/properties-panel.tsx`) that handles different element types:
     * Player properties (color, number, team)
     * Arrow properties (color, width, style)
     * Text annotation properties
   * Implement proper state updates when applying changes to properties.
   * **Reference:** Core Features - Tactical Board Editor

4. **Improved State Management**

   * Refactor the editor state management in `editorStoreImpl.ts` to ensure:
     * Clean state updates without side effects
     * Proper history tracking for undo/redo
     * Consistent selection/deselection behavior
     * Reliable property updates for all element types
   * **Reference:** Core Features - Tactical Board Editor

5. **Device Responsiveness**

   * Implement the `useDevice` hook (`/hooks/use-device.ts`) to detect device type and orientation.
   * Adjust the tactical board layout based on device capabilities.
   * Ensure touch interactions work properly on mobile and tablet devices.
   * **Reference:** Project Overview - Additional Requirements

6. **Validation Step**

   * Test the enhanced tactical board on:
     * Different devices (desktop, tablet, mobile)
     * Various input methods (mouse, touch)
     * Different browsers
   * Verify that all element types can be created, selected, edited, and deleted without issues.
   * Ensure properties are correctly applied and maintained across user sessions.

This plan lays out each step explicitly with clear file paths and commands while citing references based on the provided project documents. Follow each step carefully to ensure compliance with the design, tech stack, and security requirements.

