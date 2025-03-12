# Tech Stack Document

## Introduction

Tacticx.app is a cutting-edge, web-based tactical board built especially for football coaches, analysts, and enthusiasts. The goal of the project is to provide a simple and intuitive platform for creating, saving, and sharing football tactics. The technologies chosen for this project were carefully selected to ensure speed, scalability, and an enjoyable user experience. Every choice—from the modern interface to the robust backend services—supports the overarching mission of making tactical planning accessible while laying the groundwork for future enhancements like animations and real-time updates.

## Frontend Technologies

The frontend of Tacticx.app is built using Next.js, a powerful framework that supports efficient page routing with its App Router. The user interface is styled with TailwindCSS and ShadCN UI components, which together create a sleek dark-themed look accented with the vibrant Tactical Orange used throughout the branding. For managing application state, the project uses Zustand, which offers a simple, predictable way to handle state without the complexity of heavier libraries. Forms, such as those for authentication, are handled by React Hook Form, providing a smooth and efficient user input experience. Additionally, notifications are managed using React Toastify, ensuring users receive friendly, unobtrusive messages during operations. Minimalist icons are provided by Lucide Icons, reinforcing the clean, modern aesthetic without distraction.

## Backend Technologies

The backend of Tacticx.app is powered by Supabase, which provides an integrated solution for authentication, database management, and storage. User authentication is handled through Supabase Auth, supporting both email/password and OAuth sign-in options like Google. The database is a Supabase-hosted Postgres instance that stores tactical data in a flexible JSONB format, allowing easy future extensions such as animations. User data, tactical boards, and sharing permissions are securely stored and managed with Row-Level Security, ensuring that users can only access their own data. In addition, Supabase Storage is used to manage user profile images and other assets seamlessly.

## Infrastructure and Deployment

The application is hosted on Vercel, which facilitates one-click deployments and offers a reliable free tier for hosting Next.js applications. Continuous Integration and Continuous Deployment pipelines are implemented with GitHub Actions, ensuring that code changes are automatically tested and deployed without delay. The project also benefits from integrated logging and monitoring, utilizing Supabase logs along with Vercel Analytics to keep track of application performance and detect issues early. Centralized error handling in Next.js API routes further contributes to the robustness and reliability of the app.

## Third-Party Integrations

Tacticx.app integrates several third-party services that enhance its functionality. Social sharing features are built to generate rich metadata including OpenGraph and Twitter Cards, with future plans to extend support to LinkedIn. The authentication system leverages Supabase Auth to provide a secure, modern authentication mechanism that includes OAuth with Google. Although the MVP focuses on static tactical sharing, the architecture is set up to integrate additional third-party services in future phases, such as external football data feeds or video embedding services, expanding the app’s capabilities over time.

## Security and Performance Considerations

Security has been a fundamental consideration throughout the entire tech stack. The project uses Supabase’s built-in features like Row-Level Security to ensure that each user only accesses their own data. Additionally, advanced data encryption is enabled both for data at rest and for data in transit, further safeguarding sensitive information. To track user activity and potential unauthorized access, audit logging is implemented to monitor login attempts, data edits, and sharing actions. On the performance side, techniques such as lazy-loading of UI components, batching of API requests, and database indexing are employed to maintain fast load times and smooth user interactions. Rate-limiting API endpoints ensures that the application remains reliable under high load, and plans for future real-time updates further demonstrate a commitment to scalability.

## Conclusion and Overall Tech Stack Summary

Every technology chosen for Tacticx.app plays a vital role in creating a seamless, user-friendly tactical board experience. The frontend is designed with modern tools like Next.js and TailwindCSS to deliver an outstanding visual and interactive experience, while state management and form handling are simplified through Zustand and React Hook Form. The backend services provided by Supabase cover authentication, database storage, and file management, ensuring that user data is secure and well-organized. Deployment is streamlined with Vercel and GitHub Actions, making it easy for developers to implement updates and detect issues quickly. With third-party integrations that enhance social sharing and rigorous security and performance measures in place, Tacticx.app not only meets its present needs but also lays a solid foundation for future growth. This thoughtful combination of technologies truly exemplifies the project’s commitment to simplicity, scalability, and security, setting it apart as a unique solution in the realm of football tactical planning.

