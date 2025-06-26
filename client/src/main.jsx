import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import {createBrowserRouter, RouterProvider, } from "react-router";
import SignInPage from './SignInPage.jsx';
import HomePage from './HomePage.jsx';
import SignUpPage from './SignUpPage.jsx';

const routes = createBrowserRouter([
  {
    path: "/", element: <HomePage />
  },
  {
    path: "/signin", element: <SignInPage />
  },
  {
    path: "/signup", element: <SignUpPage />
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={routes} />
  </StrictMode>
);
