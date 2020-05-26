import React from "react";
import logo from "./logo.svg";
import "./App.css";

import ReactDOM from "react-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import CheckoutForm from "./components/CheckoutForm";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.

// vivianlim@: ADD PUBLISHABLE TEST KEY HERE (NOT PRODUCTION)
const stripePromise = loadStripe("pk_test_key_here");

function App() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}

export default App;
