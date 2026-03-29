import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native'
import React from 'react'
//import { dummyUser } from '@/assets/assets'
import { useRouter } from 'expo-router'
import Header from '@/components/Header'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, PROFILE_MENU } from '@/constants'
import { useClerk, useUser } from '@clerk/expo';

export default function Profile() {
  const {user} =useUser();//here we get that logged in user data from the clerk
  const { signOut } = useClerk()

  const router =useRouter();

  const handlelogout =async()=>{
    //here we delete the token data from the Async Storage
    signOut();
    router.replace("/(auth)/sign-in")
  }


  return (
    <View className='flex-1 bg-surface '>
      <Header title='Profile' />
      <ScrollView className='flex-1 px-4' contentContainerStyle ={!user ?{flex:1,
        justifyContent:"center" ,alignItems:"center"}:
        {paddingTop:13}}>
          {!user ?(
            //Guser User Screen
            <View className='items-center w-full'>
              <View>
                <Ionicons name='person' size={40} color={COLORS.secondary} />
              </View>
              <Text className='text-primary font-bold text-xl mb-2'>Guest User</Text>
              <Text className='text-secondary text-base mb-8 text-center w-3/4 px-4'>Log to view your profile ,order and addresses..</Text>
              <TouchableOpacity className='bg-primary w-3/5 py-3 rounded-full items-center shadow-lg' onPress={()=>router.push("/(auth)/sign-in")}>
                <Text className='text-white font-bold text-lg'>Login / Signup</Text>
              </TouchableOpacity>
            </View>
          ):(//Profile infor
            <>
              <View className='items-center mb-8'>
                
                  <View className='mb-3'>
                    <Image source={{uri:user.imageUrl}} className='size-20 border-2 border-white shadow-sm rounded-full'/>
                  </View>
                  <Text className='text-xl font-bold text-primary'>{user.firstName + " " + user.lastName}</Text>
                  <Text className='text-secondary text-sm'>{user.emailAddresses[0].emailAddress}</Text>

                  {/**Admin Panel Button if its  user */}
                  {user.publicMetadata?.role==="admin" && (
                    <TouchableOpacity onPress={()=>router.push("/admin")} className='mt-4 bg-primary px-6 py-2 rounded-full'>
                      <Text className='text-white font-bold'>Admin Panel</Text>
                    </TouchableOpacity>
                  )}


              </View>

              {/**Menu */}
              <View>
                 {PROFILE_MENU.map((item,index)=>(
                  <TouchableOpacity key={item.id} className={`flex-row items-center p-4 bg-white 
                    ${index!==PROFILE_MENU.length-1 ? "border-b border-gray-100":""}`}
                     onPress={()=>router.push(item.route as any)}
                    >
                      <View className='w-10 h-10 bg-surface rounded-full items-center justify-center mr-4'>
                        <Ionicons name={item.icon as any} size={20} color={COLORS.primary}/>
                      </View>
                      <Text className='flex-1 text-primary font-medium'>{item.title}</Text>
                      <Ionicons name='chevron-forward' size={20} color={COLORS.secondary} />
                  </TouchableOpacity>
                 ))}
              </View>

              {/**Logout Button */}
              <TouchableOpacity className='flex-row items-center justify-center p-4'  onPress={handlelogout} 
              >
                <Text className='text-red-500 font-bold ml-2'>Log out</Text>
              </TouchableOpacity>
            </>
          )}

      </ScrollView>
    </View>
  )
}