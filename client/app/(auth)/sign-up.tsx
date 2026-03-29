import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Link, type Href } from "expo-router";
import { useSignUp } from "@clerk/expo";
import { COLORS } from "@/constants";

export default function SignUpScreen() {
    const {  signUp, errors, fetchStatus } = useSignUp();

    const router = useRouter();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [code, setCode] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);

    const onSignUpPress = async () => {
        //if (!isLoaded) return;
        // in Cleark isLoaded is not found on the cleark

        if (!emailAddress || !password || !firstName || !lastName) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please fill in all fields'
            });
            return;
        }

        try {
            const { error } = await signUp.password({
                emailAddress,
                password,
                firstName,
                lastName,
            });

            if (error) {
                console.error(JSON.stringify(error, null, 2));
                Toast.show({
                    type: 'error',
                    text1: 'Failed to Sign Up',
                    text2: error.message ?? "Something went wrong"
                });
                return;
            }

            if (!error) await signUp.verifications.sendEmailCode();

            setPendingVerification(true);
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            Toast.show({
                type: 'error',
                text1: 'Failed to Sign Up',
                text2: err?.errors?.[0]?.message ?? "Something went wrong"
            });
        }
    };

    const onVerifyPress = async () => {
       // if (!isLoaded) return;

        if (!code) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Enter verification code'
            });
            return;
        }

        try {
            await signUp.verifications.verifyEmailCode({
                code,
            });

            if (signUp.status === 'complete') {
                await signUp.finalize({
                    navigate: ({ session, decorateUrl }) => {
                        if (session?.currentTask) {
                            console.log(session?.currentTask);
                            return;
                        }
                        const url = decorateUrl('/');
                        router.replace(url as Href);
                    },
                });
            } else {
                console.error('Sign-up attempt not complete:', signUp);
                Toast.show({
                    type: 'error',
                    text1: 'Verification incomplete'
                });
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            Toast.show({
                type: 'error',
                text1: 'Failed to Verify',
                text2: err?.errors?.[0]?.message ?? "Invalid code"
            });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white justify-center" style={{ padding: 28 }}>
            {!pendingVerification ? (
                <>
                    <TouchableOpacity onPress={() => router.push("/")} className="absolute top-12 z-10">
                        <Ionicons name="arrow-back" size={24} color={COLORS.primary || "#000"} />
                    </TouchableOpacity>

                    <View className="items-center mb-8">
                        <Text className="text-3xl font-bold text-primary mb-2">Create Account</Text>
                        <Text className="text-gray-500">Sign up to get started</Text>
                    </View>

                    <View className="mb-4">
                        <Text className="font-medium mb-2">First Name</Text>
                        <TextInput className="w-full bg-gray-100 p-4 rounded-xl" placeholder="John" value={firstName} onChangeText={setFirstName} />
                        {errors?.fields?.firstName && (
                            <Text className="text-red-500 text-sm mt-1">{errors.fields.firstName.message}</Text>
                        )}
                    </View>

                    <View className="mb-6">
                        <Text className="font-medium mb-2">Last Name</Text>
                        <TextInput className="w-full bg-gray-100 p-4 rounded-xl" placeholder="Doe" value={lastName} onChangeText={setLastName} />
                        {errors?.fields?.lastName && (
                            <Text className="text-red-500 text-sm mt-1">{errors.fields.lastName.message}</Text>
                        )}
                    </View>

                    <View className="mb-4">
                        <Text className="font-medium mb-2">Email</Text>
                        <TextInput className="w-full bg-gray-100 p-4 rounded-xl" placeholder="user@example.com" autoCapitalize="none" keyboardType="email-address" value={emailAddress} onChangeText={setEmailAddress} />
                        {errors?.fields?.emailAddress && (
                            <Text className="text-red-500 text-sm mt-1">{errors.fields.emailAddress.message}</Text>
                        )}
                    </View>

                    <View className="mb-6">
                        <Text className="font-medium mb-2">Password</Text>
                        <TextInput className="w-full bg-gray-100 p-4 rounded-xl" placeholder="********" secureTextEntry value={password} onChangeText={setPassword} />
                        {errors?.fields?.password && (
                            <Text className="text-red-500 text-sm mt-1">{errors.fields.password.message}</Text>
                        )}
                    </View>

                    <TouchableOpacity className="w-full bg-blue-600 py-4 rounded-full items-center mb-10" onPress={onSignUpPress} disabled={fetchStatus === 'fetching'}>
                        {fetchStatus === 'fetching' ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Continue</Text>}
                    </TouchableOpacity>

                    {/* Required for sign-up flows - Clerk's bot sign-up protection */}
                    <View nativeID="clerk-captcha" />

                    <View className="flex-row justify-center">
                        <Text className="text-gray-500">Already have an account? </Text>
                        <Link href="/sign-in">
                            <Text className="text-blue-600 font-bold">Login</Text>
                        </Link>
                    </View>
                </>
            ) : (
                <>
                    <TouchableOpacity onPress={() => setPendingVerification(false)} className="absolute top-12 z-10">
                        <Ionicons name="arrow-back" size={24} color={COLORS.primary || "#000"} />
                    </TouchableOpacity>

                    <View className="items-center mb-8 mt-10">
                        <Text className="text-3xl font-bold text-primary mb-2">Verify Email</Text>
                        <Text className="text-gray-500 text-center">Enter the code sent to your email</Text>
                    </View>

                    <View className="mb-6">
                        <TextInput className="w-full bg-gray-100 p-4 rounded-xl text-center tracking-widest text-lg" placeholder="123456" keyboardType="number-pad" value={code} onChangeText={setCode} />
                        {errors?.fields?.code && (
                            <Text className="text-red-500 text-sm mt-1 text-center">{errors.fields.code.message}</Text>
                        )}
                    </View>

                    <TouchableOpacity className="w-full bg-blue-600 py-4 rounded-full items-center" onPress={onVerifyPress} disabled={fetchStatus === 'fetching'}>
                        {fetchStatus === 'fetching' ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Verify</Text>}
                    </TouchableOpacity>
                </>
            )}
        </SafeAreaView>
    );
}