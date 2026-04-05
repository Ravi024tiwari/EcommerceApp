import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import Header from '@/components/Header'
import { COLORS } from '@/constants'
import { useUser } from '@clerk/expo'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'

export default function Settings() {
  const { user } = useUser()
  const [isUploading, setIsUploading] = useState(false);//for the update of the image

  const pickAndUploadImage = async () => {
    try {
      // 1. Request Media Library Permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Refused", "You need to allow access to your photos to change your profile picture.");
        return;
      }

      // 2. Launch Image Picker
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true, // Crucial for Clerk
      });

      if (pickerResult.canceled) {
        return;
      }

      // 3. Upload to Clerk
      setIsUploading(true);
      //here we convert the image into the base64 format
      const base64Image = `data:image/jpeg;base64,${pickerResult.assets[0].base64}`;

      await user?.setProfileImage({ file: base64Image });
      
      Alert.alert("Success", "Profile picture updated successfully!");

    } catch (error: any) {
      console.error("Error uploading image: ", error);
      Alert.alert("Error", error.message || "Something went wrong while uploading the image.");
    } finally {
      setIsUploading(false);
    }
  }

  if (!user) {
    return (
      <View className='flex-1 bg-surface'>
        <Header title='Settings' showBack={true} />
        <View className="flex-1 justify-center items-center">
            <Text>Please log in to view settings.</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='flex-1 bg-surface '>
      <Header title='Settings' showBack={true} />
      
      <ScrollView className='flex-1 px-4 py-6'>
        
        {/** Profile Picture Section */}
        <View className="items-center bg-white p-6 rounded-2xl shadow-sm mb-6">
            <View className="relative">
                <Image 
                    source={{ uri: user.imageUrl }} 
                    className='size-24 rounded-full border-2 border-gray-100 bg-gray-100'
                />
                <TouchableOpacity 
                    className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-white"
                    onPress={pickAndUploadImage}
                    disabled={isUploading}
                >
                    <Ionicons name="camera" size={16} color="white" />
                </TouchableOpacity>
            </View>

            {isUploading ? (
                <View className="mt-4 flex-row items-center">
                    <ActivityIndicator size="small" color={COLORS.primary} className="mr-2" />
                    <Text className="text-secondary">Uploading image...</Text>
                </View>
            ) : (
                <TouchableOpacity 
                    className='mt-4 px-6 py-2 bg-gray-100 rounded-full'
                    onPress={pickAndUploadImage}
                >
                    <Text className='font-semibold text-primary'>Change Picture</Text>
                </TouchableOpacity>
            )}
        </View>

        {/** User Details Read-Only Section */}
        <View className="bg-white p-4 rounded-2xl shadow-sm">
            <Text className="font-bold text-lg mb-4 text-primary">Personal Information</Text>
            
            <View className="mb-4">
                <Text className="text-secondary text-sm mb-1">First Name</Text>
                <View className="bg-surface px-4 py-3 rounded-xl border border-gray-100">
                    <Text className="text-primary font-medium">{user.firstName || 'N/A'}</Text>
                </View>
            </View>

            <View className="mb-4">
                <Text className="text-secondary text-sm mb-1">Last Name</Text>
                <View className="bg-surface px-4 py-3 rounded-xl border border-gray-100">
                    <Text className="text-primary font-medium">{user.lastName || 'N/A'}</Text>
                </View>
            </View>            

            <View className="mb-2">
                <Text className="text-secondary text-sm mb-1">Email Address</Text>
                <View className="bg-surface px-4 py-3 rounded-xl border border-gray-100">
                    <Text className="text-primary font-medium">{user.emailAddresses[0]?.emailAddress || 'N/A'}</Text>
                </View>
            </View>  

        </View>

      </ScrollView>
    </View>
  )
}
