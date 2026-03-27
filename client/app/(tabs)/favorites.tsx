import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useWishlist } from '@/context/WishlistContext'
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import { ScrollView } from 'react-native-gesture-handler';
import ProductCard from '@/components/ProductCard';

export default function Favorites() {

  const {wishlist} =useWishlist();
  const router =useRouter();
  return (
    <View className='flex-1 bg-surface'>
      <Header title='Wishlist' showMenu showCart />



      {wishlist.length>0 ? ( // in the Wishlist me jo hum favorites select krte hai bss whi render krwange with that product of times
        <ScrollView className='flex-1 px-4 mt-4' showsVerticalScrollIndicator={false}>
          <View className='flex-row flex-wrap justify-between'>
            {wishlist.map((item,index)=>(
              <ProductCard  key={index} product={item}/>
            ))}
          </View>

        </ScrollView>
      ):(
        <View className='flex-1 items-center justify-center'>
            <Text className='text-secondary text-lg'>Your WishList is Empty</Text>
            <TouchableOpacity onPress={()=>router.push("/")} className='mt-4'>
              <Text className='text-primary font-bold'>Start Shopping</Text>
            </TouchableOpacity>
        </View>
      )}
    </View>
  )
}