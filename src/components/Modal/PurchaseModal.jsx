/* eslint-disable react/prop-types */
import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { Fragment, useState } from 'react'
import Button from '../Shared/Button/Button'
import useAuth from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import useAxiosSecure from '../../hooks/useAxiosSecure'
import { useNavigate } from 'react-router-dom'
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import CheckoutForm from '../Form/CheckOutForm'
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

const PurchaseModal = ({ closeModal, isOpen,plant ,refetch}) => {
const {user} = useAuth()
const navigate = useNavigate()
const axiosSecure = useAxiosSecure()
const [totalQuantity,setTotalQuantity] = useState(1)
  const {name,category,description,image,price,sellerInfo,quantity,_id} = plant
  const [totalPrice,setTotalPrice] = useState(price)
  const [purchaseInfo,setPurchaseInfo] = useState({
    customerInfo:{
      name:user?.displayName,
      email:user?.email,
      image:user?.photoURL
    },
    plantId:_id,
    price:totalPrice,
    quantity:totalQuantity,
    seller:sellerInfo?.email,
    address:'',
    status:'Pending'
  })
  
  // Total Price Calculation

  const handleQuantity = (value)=>{
    if(value>quantity){
      setTotalQuantity(quantity)
      return toast.error('quantity exceeds available stock')

    }
    if(value<=0){
      setTotalQuantity(1)
      return toast.error('quantity cannot be less then 1')
    }
    setTotalQuantity(value)
    setTotalPrice(value*price)
    setPurchaseInfo((prev)=>{
      return {...prev,quantity:value,price:value*price}
    })


  }

  const handlePurchase = async()=>{
          console.log(purchaseInfo)

          // post request to db
          try{
            const {data} = await axiosSecure.post('/order',purchaseInfo)
           

            // update quantity req
             await axiosSecure.patch(`/plants/quantity/${_id}`,{
              quantityToUpdate:totalQuantity,status:'decrease'
             })

             console.log(data)
             toast.success('Order Successful')
             refetch()
             navigate('/dashboard/my-orders')
          }catch(err){
            console.log(err)

          }finally{
            closeModal()
          }


  }
  console.log(totalQuantity)

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={closeModal}>
        <TransitionChild
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
        </TransitionChild>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <TransitionChild
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <DialogPanel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                <DialogTitle
                  as='h3'
                  className='text-lg font-medium text-center leading-6 text-gray-900'
                >
                  Review Info Before Purchase
                </DialogTitle>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>Plant: {name}</p>
                </div>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>Category: {category}</p>
                </div>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>Customer: {user?.displayName}</p>
                </div>

                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>Price: $ {price}</p>
                </div>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>Available Quantity: {quantity}</p>
                </div>
                {/* quantity input field */}
                <div className='space-x-2 text-sm mt-2'>
                  <label htmlFor="quantity">Quantity</label>
                  <input
                  
                  name='quantity'
                  value={totalQuantity}
                  onChange={(e)=>handleQuantity(parseInt(e.target.value))}
                  className='p-2 text-gray-800 border  border-lime-300 focus:outline-lime-500 rounded-md bg-white'
                   type="number"
                   placeholder='Available quantity'
                   required
                   />
                </div>

                {/* address input field */}
                <div className='space-x-2 text-sm mt-2'>
                  <label htmlFor="address">Address</label>
                  <input
                  onChange={(e)=>setPurchaseInfo((prev)=>{
                    return {...prev,address:e.target.value}
                  })}
                  name='address'
                  className='p-2 text-gray-800 border  border-lime-300 focus:outline-lime-500 rounded-md bg-white'
                   type="text"
                   placeholder='Shipping address'
                   required
                   />
                </div>
                {/* checkout form */}
                <Elements stripe={stripePromise}>
                  {/* form component */}
                  <CheckoutForm totalQuantity={totalQuantity} closeModal={closeModal} purchaseInfo={purchaseInfo} refetch={refetch}></CheckoutForm>
                </Elements>

               
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default PurchaseModal
