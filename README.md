# Dairy Expo 2025 – Guest Registration & Gift Delivery System

This repository hosts the frontend for a real ar‑time guest registration and gift delivery management system developed for Shir Alat Rassan Company at the International Dairy Expo 2025. Built with **React** and **Vite**, the app enables staff to register guests, track gifts, and instantly propagate updates across all connected devices via **Socket.io**.

## Key Features

- **Comprehensive guest registration** – Capture the guest’s name, company, phone, and other details via an intuitive form.
- **Gift management** – Record, update, and confirm gift deliveries for each attendee.
- **Real‑time updates** – All registrations and gift changes are pushed to every connected client using WebSockets (Socket.io), ensuring a single source of truth.
- **Responsive & accessible UI** – Constructed with React 19 and Bootstrap 5 for a polished look on desktop and mobile.
- **Smooth client‑side routing** – Powered by React Router v7 for lightning‑fast page transitions.
- **Dynamic search & filters** – Use React Select components for dropdowns and filtering lists.
- **Persian typography support** – The IranSans font delivers crisp Persian text rendering.

## Technology Stack

| Technology        | Purpose                          |
|-------------------|----------------------------------|
| **React 19**      | UI framework                     |
| **Vite**          | Build tool & development server  |
| **Socket.io**     | Real‑time WebSocket communication|
| **Bootstrap 5**   | Styling & layout                 |
| **React Router v7** | Client‑side routing             |
| **React Select**  | Custom dropdowns & filters       |
| **IranSans**      | Persian font family              |

## Getting Started

Follow these steps to run the project locally:

1. **Clone the repository**

   ```bash
   git clone https://github.com/aligoodi77/Rassan-exhibition-frontend.git
   cd Rassan-exhibition-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

   Vite will start a dev server (by default on `http://localhost:5173`) with hot reload enabled.

4. **Build for production**

   ```bash
   npm run build
   ```

   The compiled output will be generated in the `dist` folder.

## Project Structure

```
├── public/               # Static assets (favicon, icons, images)
├── src/
│   ├── components/       # Shared reusable components
│   ├── pages/            # Page components and routing
│   ├── services/         # API and WebSocket helpers
│   ├── styles/           # SCSS/CSS files
│   └── main.jsx          # Application entry point
├── index.html            # Base HTML template
├── package.json          # Project metadata & scripts
└── vite.config.js        # Vite configuration
```

This overview may differ slightly, but the structure illustrates how concerns are separated into reusable parts.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or create a pull request.

## License

This project is released under the [MIT License](LICENSE). You are free to use, modify, and distribute it for personal and commercial purposes.
