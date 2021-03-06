import styled from 'styled-components';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import SickButton from './styles/SickButton';
import { useState } from 'react';
import nProgress from 'nprogress';
import { useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import { useCart } from '../lib/cartState';
import { useRouter } from 'next/dist/client/router';
import { CURRENT_USER_QUERY } from './User';

const CheckoutFormStyles = styled.form`
  box-shadow: 0 1px 2px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 5px;
  padding: 1rem;
  display: grid;
  grid-gap: 1rem;
`;

const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION($token: String!) {
    checkout(token: $token) {
      id
      charge
      total
      items {
        id
        name
      }
    }
  }
`;

const stripeLib = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

function CheckoutForm() {
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { closeCart } = useCart();
  const [checkout, { error: graphQLError }] = useMutation(
    CREATE_ORDER_MUTATION,
    {
      refetchQueries: [{ query: CURRENT_USER_QUERY }],
    }
  );

  async function handleSubmit(e) {
    // 1. Stop from form submission and turn on loader.
    e.preventDefault();
    setLoading(true);
    console.log('Work to be done...');

    // 2. Start page transition.
    nProgress.start();

    // 3. Create payment method via stripe. Successful token returns here.
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });
    console.log(paymentMethod);

    // 4. Handle any errors from stripe.
    if (error) {
      setError(error);
      nProgress.done();
      return; // stops checkout from happening
    }

    // 5. Send token from step 3 to our keystone server, via custom mutation.
    const order = await checkout({
      variables: {
        token: paymentMethod.id,
      },
    });
    console.log(`Finished with the order!!`);
    console.log(order);

    // 6. Change the page to view the order.
    router.push({
      pathname: `/order/[id]`,
      query: { id: order.data.checkout.id },
    });

    // 7. Close the cart.
    closeCart();

    // 8. Turn off loader.
    setLoading(false);
    nProgress.done();
  }

  return (
    <CheckoutFormStyles onSubmit={handleSubmit}>
      {error && <p style={{ fontSize: 12 }}>{error.message}</p>}
      {graphQLError && <p style={{ fontSize: 12 }}>{graphQLError.message}</p>}
      <CardElement />
      <SickButton>Check Out Now</SickButton>
    </CheckoutFormStyles>
  );
}

function Checkout() {
  return (
    <Elements stripe={stripeLib}>
      <CheckoutForm />
    </Elements>
  );
}
export { Checkout };
