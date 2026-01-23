import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. Import Apollo Client
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// 2. Setting Koneksi ke Backend
const client = new ApolloClient({
  uri: 'http://localhost:4000/', // Alamat Backend kamu
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. Bungkus App dengan ApolloProvider */}
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
)