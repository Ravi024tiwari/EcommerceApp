import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'expo-router'
import { Address } from '@/constants/types'
// Removed unused dummyAddress to keep it clean
import Toast from 'react-native-toast-message'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '@/constants'
import Header from '@/components/Header'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@clerk/expo'
import api from '@/constants/api'

// 1. IMPORT STRIPE
import { useStripe } from '@stripe/stripe-react-native'

export default function Checkout() {
    const {getToken} = useAuth()
    const {cartTotal, clearCart} = useCart()
    const router = useRouter();

    // 2. INITIALIZE STRIPE HOOK
    const { initPaymentSheet, presentPaymentSheet } = useStripe(); //here we use the stripe payment method with it

    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<"cash"|"stripe">('cash')

    const shipping = 2.0;
    const tax = 0;
    const total = cartTotal + shipping + tax;

    const fetchAddress = async () => {
        try {
            const token = await getToken();
            const {data} = await api.get("/address",{
                headers: { Authorization: `Bearer ${token}` }
            })
            const addrList = data.addresses;

            if(addrList.length > 0){
                const def = addrList.find((a:Address) => a.isDefault ) || addrList[0];
                setSelectedAddress(def);
            }
        } catch (error:any) {
            Toast.show({ type:'error', text1:'Error', text2:"Failed to load checkout information.." })
        } finally {
            setPageLoading(false)
        }
    }
   
    const handlePlaceOrder = async () => {
        if(!selectedAddress){
            Toast.show({ type:"error", text1:"Error", text2:"Please add a shipping address.." })
            return;
        }

        setLoading(true);

        try {
            const token = await getToken();

            // 3. STRIPE LOGIC INTERCEPTION
            if (paymentMethod === "stripe") {
                // Step A: Get clientSecret from backend

                const { data: intentData } = await api.post("/orders/create-payment-intent", {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!intentData.success || !intentData.clientSecret) {
                    throw new Error("Failed to initialize Stripe Payment.");
                }

                // Step B: Setup the visual Payment Sheet
                const initResponse = await initPaymentSheet({
                    merchantDisplayName: 'My Ecommerce App',
                    paymentIntentClientSecret: intentData.clientSecret,
                    appearance: { colors: { primary: COLORS.primary } } // Matches your app's primary color!
                });

                if(initResponse.error) {
                    throw new Error(initResponse.error.message);
                }

                // Step C: Show the Payment UI to the user

                const paymentResponse = await presentPaymentSheet();

                if (paymentResponse.error) {
                    // User canceled or card failed. Stop execution!
                    setLoading(false);
                    return Toast.show({
                        type: 'error',
                        text1: 'Payment Failed',
                        text2: paymentResponse.error.message
                    });
                }
                
                // IF WE REACH HERE, STRIPE WAS SUCCESSFUL!
            }

            // 4. COMMON ORDER CREATION (Runs for Cash or successful Stripe)
            
            const payload = {
                shippingAddress: {
                    street: selectedAddress.street,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    zipCode: selectedAddress.zipCode,
                    country: selectedAddress.country
                },
                notes: "Placed via App",
                paymentMethod: paymentMethod
             };

             const freshToken =await getToken();

             const { data } = await api.post("/orders", payload, {
                headers: { Authorization: `Bearer ${freshToken}` }
             });

             if(data.success){
                await clearCart();
                Toast.show({ type:'success', text1:'Order placed', text2:'Your order placed successfully' })
                router.replace("/orders");
             }

        } catch (error:any) {
           Toast.show({
            type:'error',
            text1:'Failed to place order..',
            text2: error.response?.data?.message || error.message || 'Something went wrong..'
           });   
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        fetchAddress();
    },[])

    if(pageLoading){
        return (
            <SafeAreaView className='flex-1 bg-surface justify-center items-center'>
                <ActivityIndicator size='large' color={COLORS.primary} />
            </SafeAreaView>
        )
    }

  return (
    <View className="flex-1 bg-surface">
      <Header title='Checkout' showBack/>
      <ScrollView className='flex-1 px-4 mt-4'>
            {/**Address Section */}
            <Text className='text-lg font-bold text-primary mb-4'>Shipping Address</Text>
            {selectedAddress ?(
                <View className='bg-white p-4 rounded-xl mb-6 shadow-sm'>
                   <View className='flex-row items-center justify-between mb-2'>
                    <Text className='text-base font-bold'>{selectedAddress.type}</Text>
                    <TouchableOpacity onPress={()=>router.push("/addresses")}>
                        <Text className='text-accent text-sm'>Change</Text>
                    </TouchableOpacity>
                   </View>
                   <Text className='text-secondary leading-5'>
                      {selectedAddress.street}, {selectedAddress.city}{"\n"}
                      {selectedAddress.state} {selectedAddress.zipCode}{"\n"}
                      {selectedAddress.country}
                   </Text>
                </View>
            ):(
                <TouchableOpacity className='bg-white p-6 rounded-xl mb-6 items-center justify-center border-dashed border-2 border-gray-100' onPress={()=>router.push("/addresses")}>
                    <Text className='text-primary font-bold'>Add Address</Text>
                </TouchableOpacity>
            )}

            {/**Payment Section */}
            <Text className='text-lg font-bold text-primary mb-4'>Payment Method</Text>

            {/**Cash on Delivery option */}
            <TouchableOpacity className={`bg-white p-4 rounded-xl mb-4 shadow-sm flex-row items-center border-2 ${paymentMethod==='cash'? 'border-primary':'border-transparent'}`} onPress={()=>setPaymentMethod("cash")}>
                <Ionicons name='cash-outline' size={24} color={COLORS.primary} className='mr-3'/>
                <View className='ml-3 flex-1'>
                    <Text className='text-base font-bold text-primary'>Cash on Delivery</Text>
                    <Text className='text-secondary text-xs mt-1'>Pay when you receive the order</Text>
                </View>
                {paymentMethod==="cash" && <Ionicons name='checkmark-circle' size={24} color={COLORS.primary}/>}
            </TouchableOpacity>

            {/*Stripe Option */}
            <TouchableOpacity className={`bg-white p-4 rounded-xl mb-4 shadow-sm flex-row items-center border-2 ${paymentMethod==='stripe'? 'border-primary':'border-transparent'}`} onPress={()=>setPaymentMethod("stripe")}>
                <Ionicons name='card-outline' size={24} color={COLORS.primary} className='mr-3'/>
                <View className='ml-3 flex-1'>
                    <Text className='text-base font-bold text-primary'>Pay with Card</Text>
                    <Text className='text-secondary text-xs mt-1'>Securely powered by Stripe</Text>
                </View>
                {paymentMethod==="stripe" && <Ionicons name='checkmark-circle' size={24} color={COLORS.primary}/>}
            </TouchableOpacity>
      </ScrollView>

      {/**Order Summary */}
      <View className='p-4 bg-white shadow-lg border-t border-gray-100'>
            <Text className='text-lg font-bold text-primary mb-4'>Order Summary</Text>

            <View className='flex-row justify-between mb-2'>
                <Text className='text-secondary'>SubTotal</Text>
                <Text className='font-bold'>${cartTotal.toFixed(2)}</Text>
            </View>
            <View className='flex-row justify-between mb-2'>
                <Text className='text-secondary'>Shipping</Text>
                <Text className='font-bold'>${shipping.toFixed(2)}</Text>
            </View>
            <View className='flex-row justify-between mb-4'>
                <Text className='text-secondary'>Tax</Text>
                <Text className='font-bold'>${tax.toFixed(2)}</Text>
            </View>

            <View className='flex-row justify-between mb-6'>
                <Text className='text-primary text-xl font-bold'>Total</Text>
                <Text className='text-primary text-xl font-bold'>${total.toFixed(2)}</Text>
            </View>

            {/**Place Order button */}
            <TouchableOpacity onPress={handlePlaceOrder} disabled={loading} className={`p-4 rounded-xl items-center ${loading ? 'bg-gray-400':'bg-primary'}`}>
                {loading ? <ActivityIndicator color='white'/> : <Text className='text-white font-bold text-lg'>{paymentMethod === 'stripe' ? 'Proceed to Pay' : 'Place Order'}</Text>}
            </TouchableOpacity>
      </View>
    </View>
  )
}
