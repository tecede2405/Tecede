import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from "./context/AuthContext";
import { MoviesProvider } from "./context/MoviesContext";
import { DonateProvider } from "./context/DonateContext";
import { MusicProvider } from "./context/MusicContext";
import { CommentProvider } from "./context/CommentContext";
import { ThemeProvider } from "./context/ThemeContext";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

const queryClient = new QueryClient();

root.render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MoviesProvider>
          <DonateProvider>
            <MusicProvider>
              <CommentProvider>
                <ThemeProvider>
                  <BrowserRouter>
                    <App />
                  </BrowserRouter>
                </ThemeProvider>
              </CommentProvider>
            </MusicProvider>
          </DonateProvider>
        </MoviesProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

reportWebVitals();