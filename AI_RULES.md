# AI Rules for Dental Clinic Management System

This document outlines the core technologies used in this application and provides clear guidelines for using specific libraries and tools. Adhering to these rules ensures consistency, maintainability, and leverages the strengths of the chosen tech stack.

## Tech Stack Overview

*   **Frontend Framework**: Next.js 14 (App Router) for building the user interface with server-side rendering capabilities.
*   **Language**: TypeScript is used across the entire application for enhanced type safety and developer experience.
*   **Styling**: Tailwind CSS for a utility-first approach to styling, ensuring responsive and consistent UI design.
*   **UI Components**: `shadcn/ui` components (built on Radix UI primitives) provide accessible and customizable UI elements.
*   **Icons**: `lucide-react` is integrated for a comprehensive and easily customizable icon set.
*   **State Management**: React's Context API is primarily used for managing application-wide state, with `Zustand` as an option for more complex global state needs.
*   **Backend Framework**: Express.js powers the RESTful API, handling business logic and data interactions.
*   **Database**: MongoDB with Mongoose ODM for flexible and scalable NoSQL data storage.
*   **Authentication**: JWT (JSON Web Tokens) is implemented for secure user authentication and authorization.
*   **File Uploads**: Multer handles file uploads on the backend, with Cloudinary used for cloud storage of images and other files.
*   **Form Handling & Validation**: `react-hook-form` is used for efficient form management, paired with `Zod` for robust schema validation on the frontend (and `Joi` on the backend).
*   **Date Management**: `date-fns` is utilized for all date manipulation and formatting tasks.
*   **PDF Generation**: `jspdf` is available for client-side generation of PDF documents.
*   **Theming**: `next-themes` provides seamless dark/light mode switching functionality.
*   **Internationalization**: A custom `LanguageProvider` handles multi-language support for the application's text.

## Library Usage Rules

To maintain consistency and efficiency, please follow these guidelines when developing:

*   **UI Components**:
    *   **Always** use existing `shadcn/ui` components (e.g., `Button`, `Input`, `Card`, `Dialog`, `Select`, `Tabs`, `Checkbox`, `Label`, `Textarea`, `Badge`, `Collapsible`, `Separator`, `ScrollArea`, `Toast`).
    *   **Do NOT** modify the files within `components/ui/`. If a `shadcn/ui` component needs customization beyond its props, create a new component in `src/components/` that wraps or extends the `shadcn/ui` component, or build a new component from Radix UI primitives and Tailwind CSS.
*   **Icons**: Use icons exclusively from the `lucide-react` library.
*   **Styling**: Apply styling using Tailwind CSS classes. Avoid inline styles or custom CSS files unless absolutely necessary for unique, non-Tailwind-compatible requirements.
*   **State Management**:
    *   For component-specific state, use React's `useState` hook.
    *   For sharing state between components, prefer React's `useContext` with a dedicated context provider.
    *   If global state management becomes complex, `Zustand` is an approved alternative.
*   **API Communication (Frontend)**:
    *   All interactions with the backend API **must** go through the `ApiService` located in `services/api.js`.
    *   For client-specific data, use `ClientService` in `services/clientService.js`.
    *   For treatment-related data, use `TreatmentService` in `services/treatmentService.js`.
    *   For file uploads, use `UploadService` in `services/uploadService.js`.
*   **Authentication**: Use `AuthService` in `services/authService.js` for all authentication-related operations (login, register, logout, current user).
*   **Date Handling**: Utilize `date-fns` for all date parsing, formatting, and manipulation. The custom `utils/date-formatter.ts` should be used for application-specific date display formats.
*   **Form Handling**: Implement forms using `react-hook-form` for controlled inputs and validation.
*   **Form Validation**: Use `Zod` for defining and validating form schemas on the frontend. On the backend, `Joi` is used for validation.
*   **Notifications**: For user feedback and notifications, use the `useToast` hook and `Toaster` component provided in `components/ui/toast.tsx` and `components/toaster.tsx`.
*   **Theming**: Manage dark/light mode using the `ThemeProvider` from `components/theme-provider.tsx` (which wraps `next-themes`).
*   **Internationalization**: All user-facing text should be managed through the `LanguageProvider` and accessed via the `useLanguage` hook from `components/language-provider.tsx`.
*   **File Structure**:
    *   New components should be placed in `src/components/`.
    *   New pages should be placed in `src/pages/`.
    *   Utility functions should be placed in `src/utils/`.
    *   API service wrappers should be in `src/services/`.
*   **Error Handling**: Do not use `try/catch` blocks for API calls unless specifically requested for a particular feature. Errors should bubble up to be handled globally by the framework or a dedicated error boundary.