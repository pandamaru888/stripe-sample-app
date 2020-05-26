import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import CardSection from "./CardSection";

import axios from "axios";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [confirmPaymentIntent, setConfirmPaymentIntent] = useState<boolean>(
    false
  );
  const [errorReceived, setErrorReceived] = useState<boolean>(false);
  const [uiError, setUiError] = useState<string>("");
  const [successReceived, setSuccessReceived] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("");
  const [secret, setSecret] = useState<string>();

  const handlePaymentIntent = async () => {
    setErrorReceived(false);
    setUiError("");
    setSuccessReceived(false);
    setAmount(0);
    setCurrency("");
    setConfirmPaymentIntent(true);
    // make server call for setting up Payment Intent

    const temp = await axios.post("/create-payment-intent", {
      items: ["A pin"],
      currency: "USD",
    });
    setSecret(temp.data.clientSecret);
  };

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    if (!!!secret) return;

    const card = elements.getElement(CardElement);
    if (!card) {
      return;
    }

    const result = await stripe.confirmCardPayment(secret, {
      payment_method: {
        card,
        billing_details: {
          name: "Jenny Rosen",
        },
      },
    });

    if (result.error) {
      // Show error to your customer (e.g., insufficient funds)

      if (result.error.message) {
        console.log(result.error.message);
        setErrorReceived(true);
        setUiError(result.error.message);
      }
    } else {
      // The payment has been processed!
      if (result.paymentIntent?.status === "succeeded") {
        console.log(result);
        setSuccessReceived(true);
        if (result.paymentIntent.amount)
          setAmount(result.paymentIntent.amount / 100);
        if (result.paymentIntent.currency)
          setCurrency(result.paymentIntent.currency);

        // Show a success message to your customer
        // There's a risk of the customer closing the window before callback
        // execution. Set up a webhook or plugin to listen for the
        // payment_intent.succeeded event that handles any business critical
        // post-payment actions.
      }
    }
  };

  return (
    <div>
      <div>This pin costs $20.</div>
      <button onClick={handlePaymentIntent}>Yes, buy pin</button>
      {confirmPaymentIntent ? (
        <div>
          <form onSubmit={handleSubmit}>
            <CardSection />
            <button disabled={!stripe}>Confirm order</button>
          </form>
        </div>
      ) : (
        ""
      )}
      {errorReceived ? <div>{uiError}</div> : ""}
      {successReceived ? (
        <div>
          <div>Congratulations! You're the proud owner of a shiny new pin.</div>
          <div>
            Amount Charged: ${amount} {currency}
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
