import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'expo-router'
import { Address } from '@/constants/types'
import { dummyAddress } from '@/assets/assets'
import Toast from 'react-native-toast-message'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '@/constants'
import Header from '@/components/Header'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@clerk/expo'
import api from '@/constants/api'

export default function Checkout() {
   const {getToken} =useAuth()
    const {cartTotal,clearCart} =useCart()
    const router =useRouter();

    const [loading,setLoading] =useState(false)

    const[pageLoading,setPageLoading] =useState(true)// its loading for the page

    const [selectedAddress,setSelectedAddress] =useState<Address | null>(null)

    const [paymentMethod,setPaymentMethod] =useState<"cash"|"stripe">('cash')

    const shipping =2.0;
    const tax =0;
    const total =cartTotal +shipping +tax; //shipping charges are included

    const fetchAddress =async()=>{
        try {
            const token =await getToken();
            const {data} =await api.get("/address",{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            const addrList =data.addresses;//here we get all the address
            console.log("The address resposne + addList :",addrList)

            if(addrList.length>0 ){
                const def =addrList.find((a:Address)=>a.isDefault )|| addrList[0];//get the default address
                setSelectedAddress(def);
            }
        } catch (error:any) {
            console.error("Failed to fetch the address",error)
            Toast.show({
                type:'error',
                text1:'Error',
                text2:"Failed to load checkout information.."
            })
        }
        finally{
            setPageLoading(false)
        }
    }

    const handlePlaceOrder =async()=>{// during placing the order we have to select the add + type of payment should i select

        if(!selectedAddress){
            Toast.show({
                type:"error",
                text1:"Error",
                text2:"Please add a shipping address.."
            })
            return ;
        }
        if(paymentMethod==="stripe"){
            return Toast.show({
                type:"error",
                text1:"Info",
                text2:"Stripe not implemented yet.."
            })
        }

        //Cash on Deliver
        setLoading(true)
        try {
            const payload  ={
                shippingAddress :{
                    street: selectedAddress.street,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    zipCode: selectedAddress.zipCode,
                    country: selectedAddress.country
                },
                notes:"Places via App",
                paymentMethod:"cash"
             }
             console.log("The payload of order-creation :",payload)

             const token =await getToken();
             const {data} =await api.post("/orders",payload,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
             })
             console.log("The response from the backend during creation of new order:",data)

             if(data.success){ //here its call the clear cart
                await clearCart();//here its clear the cart after payment of that order from the Context

                Toast.show({
                    type:'success',
                    text1:'Order placed',
                    text2:'Your order places successfully'
                })

                router.replace("/orders")
             }
        } catch (error:any) {
           console.log('Failed to place Order..',error)
           Toast.show({
            type:'error',
            text1:'Failed to place order..',
            text2:error.response?.data?.message || 'Something went wrong..'
           })   
        }
        finally{
            setLoading(false)
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
      <Header title='Checkout'  showBack/>
      <ScrollView className='flex-1 px-4 mt-4'>
            {/**Adress Section */}
            <Text className='text-lg font-bold text-primary mb-4'>Shipping Address</Text>
            {selectedAddress ?(
                <View className='bg-white p-4 rounded-xl mb-6 shadow-sm'>
                   <View className='flex-row items-center justify-between mb-2'>
                    <Text className='text-base font-bold'>{selectedAddress.type}</Text>
                    <TouchableOpacity className='' onPress={()=>router.push("/addresses")}>
                        <Text className='text-accent text-sm'>Change</Text>
                    </TouchableOpacity>
                   </View>
                   <Text className='text-secondary leading-5'>
                      {selectedAddress.street},{selectedAddress.city}{"\n"}
                      {selectedAddress.state} {selectedAddress.zipCode}{"\n"}
                      {selectedAddress.country}
                      
                   </Text>
                </View>
            ):(
                <TouchableOpacity className='bg-white p-6 rounded-xl mb-6 items-center justify-center border-dashed
                     border-2 border-gray-100' onPress={()=>router.push("/addresses")}>
                    <Text className='text-primary font-bold'>Add Address</Text>
                </TouchableOpacity>
            )}

            {/**payment Section */}
            <Text className='text-lg font-bold text-primary mb-4'>Payment Method</Text>

            {/**Cash on Delivery options */}
            <TouchableOpacity className={`bg-white p-4 rounded-xl mb-4 shadow-sm flex-row items-center border-2 ${paymentMethod==='cash'?
                  'border-primary':'border-transparent'}`} onPress={()=>setPaymentMethod("cash")}>
                <Ionicons name='cash-outline' size={24} color={COLORS.primary} className='mr-3'/>
                <View className='ml-3 flex-1'>
                    <Text className='text-base font-bold text-primary'>Cash on Delivery</Text>
                    <Text className='text-secondary text-xs mt-1'>pay when you recive the order</Text>
                </View>
                {paymentMethod==="cash" && <Ionicons name='checkmark-circle' size={24} color={COLORS.primary}/>}
            </TouchableOpacity>

            {/*Strip Option */}

            <TouchableOpacity className={`bg-white p-4 rounded-xl mb-4 shadow-sm flex-row items-center border-2 ${paymentMethod==='stripe'?
                  'border-primary':'border-transparent'}`} onPress={()=>setPaymentMethod("stripe")}>
                <Ionicons name='card-outline' size={24} color={COLORS.primary} className='mr-3'/>
                <View className='ml-3 flex-1'>
                    <Text className='text-base font-bold text-primary'>Pay with Card</Text>
                    <Text className='text-secondary text-xs mt-1'>Credit or Debit Card</Text>
                </View>
                {paymentMethod==="stripe" && <Ionicons name='checkmark-circle' size={24} color={COLORS.primary}/>}
            </TouchableOpacity>
      </ScrollView>

      {/**Order Summary */}
      <View className='p-4 bg-white shadow-lg border-t border-gray-100'>
            <Text className='text-lg font-bold text-primary mb-4'>Order Summary</Text>

            {/**Sub Total */}
            <View className='flex-row justify-between mb-2'>
                <Text className='text-secondary'>SubTotal</Text>
                <Text className='font-bold'>${cartTotal.toFixed(2)}</Text>
            </View>
            {/**Shippping Charges */}
            <View className='flex-row justify-between mb-2'>
                <Text className='text-secondary'>Shipping</Text>
                <Text className='font-bold'>${shipping.toFixed(2)}</Text>
            </View>
            {/**tax */}
            <View className='flex-row justify-between mb-4'>
                <Text className='text-secondary'>Tax</Text>
                <Text className='font-bold'>${tax.toFixed(2)}</Text>
            </View>
            {/**Total Amount  */}

            <View className='flex-row justify-between mb-6'>
                <Text className='text-primary text-xl font-bold'>Total</Text>
                <Text className='text-primary text-xl font-bold'>${total.toFixed(2)}</Text>
            </View>

            {/**Place Order button */}
            <TouchableOpacity onPress={handlePlaceOrder} disabled={loading} className={`p-4 rounded-xl items-center ${loading ? 'bg-gray-400':'bg-primary'}`}>
                {loading ? <ActivityIndicator  color='white'/>:<Text className='text-white font-bold text-lg'>Place Order</Text>}
                
            </TouchableOpacity>
      </View>
    </View>
  )
}