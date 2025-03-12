# Tacticx.app – Project Requirements Document (PRD)

## 1. Project Overview

Tacticx.app is a simple, web-based tactical board designed specifically for football coaches, analysts, and enthusiasts. It allows users to create, save, and share static football tactics. The application is built with a modern interface that uses drag-and-drop elements on an interactive board, making the process of drawing and planning tactical formations both intuitive and fast. The design adopts a sleek dark mode dominated by vibrant Tactical Orange accents, giving it a modern, stylish look that aligns with the soccer-focused branding.

The main purpose of Tacticx.app is to address the need for a straightforward and user-friendly tool that helps coaches plan game strategies in a visually appealing way. By offering essential features such as user authentication, a robust tactical editor, and secure sharing options, the platform ensures that users can efficiently manage and distribute their tactical plans. The key objectives are to create a fast, secure, and developer-friendly system that can later scale to include additional collaborative and integration features without major overhauls.

## 2. In-Scope vs. Out-of-Scope

**In-Scope**

*   User authentication and profile management using Supabase Auth (Email/Password and Google OAuth).
*   A robust database structure using Supabase Postgres with tables for users, tactics (stored in JSONB), and sharing permissions.
*   A dynamic tactical board editor featuring drag-and-drop player placement, formation management, drawing tools (arrows, text annotations), and undo/redo capabilities.
*   A secure tactic viewer that lets public users see shared tactics without the need to log in.
*   Key pages including Landing Page, Editor Page (for authenticated users), Viewer Page (read-only shared tactics), Profile Page, and Dashboard for tactic management.
*   Basic social sharing capabilities with metadata support for OpenGraph, Twitter Cards, and additional support for LinkedIn.
*   Implementation of performance optimizations such as lazy-loading components, rate-limited API calls, and database indexing.

**Out-of-Scope**

*   Advanced user role distinctions beyond basic authenticated users vs. public viewers (no dedicated 'coach', 'analyst' or 'admin' roles in the MVP).
*   Real-time collaboration features or dynamic live updates on tactical movements.
*   Integration with external football data feeds or video embedding services, keeping the focus solely on static tactic sharing.
*   Complex logging or audit trails beyond basic Supabase logging (except for fundamental audit logging for security enhancements).
*   Highly detailed customization on error handling beyond toast notifications and basic user feedback mechanisms.

## 3. User Flow

When a visitor first lands on Tacticx.app, they are welcomed by a landing page that explains the app’s value and core features. The landing page highlights the intuitive design, attractive dark mode interface, and the ease with which tactics can be created. Visitors can quickly choose to sign up, log in, or try a demo of the editor in guest mode. Once engaged, a smooth authentication flow guides users through account creation using email/password or Google OAuth, with real-time toast notifications helping to resolve any errors.

After authentication, users are redirected to a personalized dashboard where they can view their saved tactics and access options to create new tactics. By clicking on the "New Tactic" button, users are taken to the tactical editor page. Here, they experience a simple yet powerful drag-and-drop interface where they can configure player positions, add annotations, and modify formations. Once editing is complete, they can save the tactic, share it via a unique URL, or view it in a read-only mode. The process is designed to be intuitive and fast, ensuring that even non-technical users can easily navigate between creating, editing, and sharing tactics.

## 4. Core Features

*   **User Authentication**

    *   Sign up and log in using Email/Password and Google OAuth via Supabase Auth.
    *   JWT-based authentication management.
    *   Profile management with options for updating username, avatar, and an optional bio.
    *   Password reset functionality for user convenience.

*   **Database Structure**

    *   Users Table: Stores user details (ID, email, name, profile picture, optional bio, and social links).
    *   Tactics Table: Stores tactic details (title, pitch data in JSONB format, visibility settings, timestamps).
    *   Sharing Table: Manages tactic permission settings (public, private, or user-specific access).

*   **Tactical Board Editor**

    *   Drag-and-drop editor for player placement.
    *   Tools for setting formations, drawing arrows, adding text annotations.
    *   Undo/redo functionality for easy mistake correction.
    *   Save capability that securely writes tactic data to the user's account.
    *   JSONB structure designed to allow future extensions like animations or state saving.

*   **Tactic Viewer**

    *   Read-only view for shared tactics.
    *   Display of tactical elements including formations and annotations.
    *   Social sharing buttons with rich metadata generation (OpenGraph, Twitter Cards, LinkedIn).

*   **Dashboard and Profile Pages**

    *   Dashboard for managing saved tactics (listing, editing, deleting).
    *   Profile page showing user’s public shared tactics along with additional information (bio, coaching credentials, social media links).

*   **Notifications & Error Handling**

    *   Use toast notifications to give clear feedback on actions like saving or login errors.
    *   Loading indicators during API calls to maintain user awareness of operations in progress.

## 5. Tech Stack & Tools

*   **Frontend**

    *   Framework: Next.js with the App Router for efficient page routing.
    *   UI: TailwindCSS combined with ShadCN for consistent design and styling.
    *   State Management: Zustand for simple and effective state operations.
    *   Form Handling: React Hook Form for managing authentication and other user input forms.
    *   Notifications: React Toastify for unobtrusive toast notifications.
    *   Icons: Lucide Icons for minimalist and modern iconography.

*   **Backend**

    *   Auth: Supabase Auth handling both OAuth and Email/Password logins.
    *   Database: Supabase Postgres using JSONB structure for storing dynamic tactic data.
    *   Storage: Supabase Storage for managing profile pictures and other assets.
    *   Security: Supabase Row-Level Security (RLS) to ensure users only access their own data.

*   **Deployment & DevOps**

    *   Hosting: Vercel for seamless, one-click deploy and handling of Next.js applications.
    *   CI/CD: GitHub Actions to automate testing and deployments.
    *   Logging & Monitoring: Supabase logs combined with Vercel Analytics for performance tracking.

*   **Developer Tools**

    *   Cursor: An advanced IDE for AI-powered coding and real-time suggestions.
    *   V0 by Vercel: An AI-powered component builder aimed at modern design patterns.

## 6. Non-Functional Requirements

*   **Performance**

    *   The application should load primary components in less than 2 seconds.
    *   Lazy-load UI components and batch API calls to optimize performance.

*   **Security**

    *   Enforce HTTPS throughout the application.
    *   Use Supabase’s built-in encryption along with additional data encryption for sensitive information.
    *   Implement rate-limiting on API endpoints to safeguard against abuse.
    *   Enable audit logging for key actions like logins, data edits, and tactic shares.

*   **Compliance & Usability**

    *   Adhere to GDPR for EU users by implementing a clear privacy policy and data handling guidelines.
    *   Ensure the app is highly accessible with mobile responsiveness and clear UI guidelines.
    *   Utilize intuitive toast notifications and loading indicators to keep users informed of the status of their operations.

## 7. Constraints & Assumptions

*   The MVP will include only the basic user roles––authenticated users and public viewers. Advanced roles (e.g., coach, analyst, admin) will be a future enhancement.
*   The tactical board editor is built to support static tactics today but must be designed with a JSONB schema that can handle future enhancements like animations or movement simulations.
*   Social sharing will be integrated with metadata support for OpenGraph, Twitter Cards, and LinkedIn without involving extra third-party data integrations in the MVP.
*   The system relies on Supabase for core backend functionalities, assuming that Supabase’s pro tier is sufficient until scaling is required.
*   Error handling and user notifications will primarily use toast notifications and loading indicators; more detailed or customized approaches may be added later.

## 8. Known Issues & Potential Pitfalls

*   **API Rate Limits and Performance:**\
    There is potential for API rate limits if many users interact with the application simultaneously. Mitigation includes batch processing of requests and implementing client-side caching.
*   **Database Scaling:**\
    If user growth exceeds the capacity of the Supabase pro tier, scaling the database might require additional planning, including indexing critical fields and optimizing queries.
*   **Security Enhancements:**\
    While Supabase provides strong security measures, additional audit logging and data encryption might introduce complexity. It is essential to balance enhanced security measures with performance considerations.
*   **Error Handling and User Feedback:**\
    In early versions, insufficient detailed error messaging might confuse non-technical users. Therefore, implementing intuitive and informative toast notifications is crucial to mitigate this risk.
*   **Future Enhancements Misalignment:**\
    The current MVP excludes real-time collaboration features and advanced user roles and animations. Clear documentation and modular design are vital to prevent technical debt when including these features later.

This document is designed to be the main reference for the AI model in generating any subsequent related documents (Tech Stack Document, Frontend Guidelines, Backend Structure, etc.). Every element, from the user flow to the detailed tech stack, has been outlined in everyday english to minimize any ambiguity and ensure a seamless development process.

