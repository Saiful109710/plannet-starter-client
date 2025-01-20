
import {CardElement, useElements, useStripe} from '@stripe/react-stripe-js';

import './CheckOutForm.css';
import Button from '../Shared/Button/Button';
import { useEffect, useState } from 'react';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CheckoutForm = ({closeModal,purchaseInfo,refetch,totalQuantity}) => {
    const [clientSecret,setClientSecret] = useState('')
    const axiosSecure = useAxiosSecure()
    const navigate = useNavigate()
  const stripe = useStripe();
  const elements = useElements();

  const [processing,setProcessing] = useState(false)

  useEffect(()=>{
        getPaymentIntent()
  },[purchaseInfo])
  console.log(clientSecret)
  const getPaymentIntent = async()=>{
    try{
        const {data} = await axiosSecure.post('/create-payment-intent',{
            quantity:purchaseInfo?.quantity,
            plantId:purchaseInfo?.plantId
        })

        setClientSecret(data?.clientSecret)
    }catch(err){
        console.log(err.response)
    }
  }

  const handleSubmit = async (event) => {
    setProcessing(true)
    // Block native form submission.
    event.preventDefault();

    if (!stripe || !elements) {
        setProcessing(false)
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const card = elements.getElement(CardElement);

    if (card == null) {
        setProcessing(false)
      return;
    }

    // Use your card Element with other Stripe.js APIs
    const {error, paymentMethod} = await stripe.createPaymentMethod({
      type: 'card',
      card,
    });

    if (error) {
        setProcessing(false)
     return console.log('[error]', error);
    } else {

       console.log('[PaymentMethod]', paymentMethod);
    }

    // confirm payment
  const {paymentIntent} =  await stripe.confirmCardPayment(clientSecret,{
        payment_method:{
            card:card,
            billing_details:{
                name:purchaseInfo?.customerInfo?.name,
                email:purchaseInfo?.customerInfo?.email
            }
        }
    })

    if(paymentIntent.status==='succeeded'){
        try{
            // save data in db
            await axiosSecure.post('/order',{...purchaseInfo,transactionId:paymentIntent?.id})

            // decrease quantity from plant collection
            await axiosSecure.patch(`/plants/quantity/${purchaseInfo?.plantId}`,{
                quantityToUpdate:totalQuantity,
                status:'decrease'
            })
            toast.success('Order Successful')
            refetch()
            navigate('/dashboard/my-orders')


        }catch(err){
            console.log(err)
        }finally{
            setProcessing(false)
            closeModal()
        }
    }
    

  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }}
      />
      <div className='flex justify-around mt-3 gap-2'>
        <Button type='submit' disabled={!stripe || !clientSecret || processing} label={`Pay ${purchaseInfo?.price}$`}></Button>
        <Button onClick={closeModal} outline={true} label='Cancel'></Button>
      </div>
      
    </form>
  );
};

export default CheckoutForm


