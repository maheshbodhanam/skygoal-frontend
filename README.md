# SkyGoal Frontend

This is the frontend repository for SkyGoal, an e-commerce platform.

## Project Setup

To set up the project locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd skygoal-frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Variables:**

    Create a `.env` file in the root directory and add your Firebase configuration:

    ```
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    The application will be accessible at `http://localhost:8080` (or another port if 8080 is in use).

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run build:dev`: Builds the app for development to the `dist` folder.
- `npm run lint`: Lints the project.
- `npm run preview`: Serves the `dist` folder locally for previewing the production build.

## Implemented Features

- **User Authentication:** Signup, Login, Logout.
- **Product Management:** Add, View, Filter, Search products.
- **Responsive Design:** Optimized for various screen sizes.

## Technologies Used

- **React**
- **TypeScript**
- **Zustand** for state management
- **React Router DOM** for navigation
- **Firebase** for authentication and storage
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **Vite** as build tool
