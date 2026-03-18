import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./app/Router";

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}