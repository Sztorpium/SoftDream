import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./app/Router";
import { AuthProvider } from "./auth/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}