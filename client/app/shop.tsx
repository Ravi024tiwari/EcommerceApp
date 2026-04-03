import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Product, ProductCardProps } from '@/constants/types'
import { dummyProducts } from '@/assets/assets'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@/components/Header'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants'
import { FlatList } from 'react-native-gesture-handler'
import ProductCard from '@/components/ProductCard'
import api from '@/constants/api'

export default function Shop() {
    const [products,setProducts] =useState<Product[]>([])

    const [loading,setLoading] =useState(true)

    const [loadingMore,setLoadingMore] = useState(false)

    const [page,setPage] =useState(1);

    const [hashMore,setHashMore] =useState(true)
    
    //its fetched the data when the components gets loaded
    // here we increase the page Number when we upload the more products
    const fetchProducts =async(pageNumber=1)=>{//agar mujhe number of products fetch krne hai screen par then we must use the pagination

        if(pageNumber===1){
            setLoading(true)
        }
        else{
            setLoadingMore(true)
        }
        try {

             const queryParams:any ={page:pageNumber,limit:10}

             const {data} = await api.get("/product",{params:queryParams})

             if(pageNumber===1){
                setProducts(data.data)
             }
             else{
                setProducts(pre=>[...pre,...data.data])
             }


            setHashMore(data.pagination.page < data.pagination.pages);
            setPage(pageNumber)

        } catch (error) {
            console.error("Pagination error:",error)
        }
        finally{
            setLoading(false)
            setLoadingMore(false)
        }
    }

    //here we do the load more functionality 

    const loadMore =()=>{
        if(!loadingMore && !loading && hashMore){
            fetchProducts(page+1);//here we pass the next page to fetch the data
        }
    }
   
    useEffect(()=>{
        fetchProducts(1);
    },[])
  return (
    <View className='flex-1 bg-surface' >
        <Header title='Shop' showBack showCart />
        <View className='flex-row gap-2 mb-3 mx-4 my-2'>
            {/**Search Bar */}
            <View className='flex-1 flex-row items-center bg-white rounded-xl boder border-gray-100'>
                <Ionicons name='search' size={20} color={COLORS.secondary} className='ml-4'/>
                <TextInput className='flex-1 ml-2 text-primary px-4 py-3' placeholder='Search products...' returnKeyLabel='search' placeholderTextColor={COLORS.secondary}/>
            </View>

            {/**Filter Icons */}
            <TouchableOpacity className='bg-gray-800 w-12 h-12 items-center justify-center rounded-xl'>
                <Ionicons name='options-outline' size={24} color='white'/>
            </TouchableOpacity>
        </View>

        {/**Loading */}
        {loading ?(
            <View className='flex-1 justify-center items-center'>
                <ActivityIndicator size='large' color={COLORS.primary} />
            </View>
        ):(
            <FlatList data={products}//iss flat list me array of products ja rhe hai 
             keyExtractor={(item)=>item._id}
             numColumns={2}
             contentContainerStyle={{
                padding:16 ,paddingBottom:100 }} 
                columnWrapperStyle={{justifyContent :'space-between'}} 
                renderItem={({item})=>(
                    <ProductCard product={item}/>
            )}

            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
                loadingMore ? (
                    <View className='py-4'>
                        <ActivityIndicator size='small' color={COLORS.primary} />
                    </View>
                ):null
            }

            ListEmptyComponent={
                !loading && (
                    <View className='flex-1 items-center justify-center
                      py-20'>
                        <Text className='text-secondary'>No products found</Text>
                      </View>
                )
            }
            
            />
        )}
    </View>
  )
}