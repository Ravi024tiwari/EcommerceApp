import { COLORS } from "@/constants";
import { useSignIn } from '@clerk/expo';
import { type Href, Link, useRouter } from "expo-router";
import * as React from "react";
import { TextInput, View, Text, ActivityIndicator, TouchableOpacity, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function Page() {
    const { signIn, fetchStatus, errors } = useSignIn();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [code, setCode] = React.useState("");
    const [showEmailCode, setShowEmailCode] = React.useState(false);

    const onSignInPress = async () => {
        try {
            const { error } = await signIn.password({
                emailAddress,
                password,
            });

            if (error) {
                console.error("Login failed:", JSON.stringify(error, null, 2));
                return;
            }

            if (signIn.status === "complete") {
                await signIn.finalize({
                    navigate: ({ session, decorateUrl }) => {
                        if (session?.currentTask) {
                            // Handle pending session tasks
                            console.log(session?.currentTask);
                            return;
                        }
                        const url = decorateUrl("/");
                        router.replace(url as Href);
                    },
                });
            } else if (signIn.status === "needs_second_factor") {
                await signIn.mfa.sendEmailCode();
                setShowEmailCode(true);
            } else if (signIn.status === "needs_client_trust") {
                // Handle Client Trust verification
                const emailCodeFactor = signIn.supportedSecondFactors.find(
                    (factor) => factor.strategy === 'email_code',
                );
                if (emailCodeFactor) {
                    await signIn.mfa.sendEmailCode();
                    setShowEmailCode(true);
                }
            } else {
                // Check why the sign-in is not complete
                console.error('Sign-in attempt not complete:', signIn);
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
    };

    const onVerifyPress = async () => {
        if (!code) return;

        try {
            await signIn.mfa.verifyEmailCode({ code });

            if (signIn.status === "complete") {
                await signIn.finalize({
                    navigate: ({ session, decorateUrl }) => {
                        if (session?.currentTask) {
                            // Handle pending session tasks
                            console.log(session?.currentTask);
                            return;
                        }
                        const url = decorateUrl("/");
                        router.replace(url as Href);
                    },
                });
            } else {
                // Check why the sign-in is not complete
                console.error('Sign-in attempt not complete:', signIn);
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
    };

    const isLoading = fetchStatus === 'fetching';

    return (
        <SafeAreaView className="flex-1 bg-white justify-center" style={{ padding: 28 }}>
            {!showEmailCode ? (
                <>
                    <TouchableOpacity onPress={() => router.push("/")} className="absolute top-12 z-10">
                        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                    </TouchableOpacity>

                    <View className="items-center mb-8">
                        <Text className="text-3xl font-bold text-primary mb-2">Welcome Back</Text>
                        <Text className="text-secondary">Sign in to continue</Text>
                    </View>

                    <View className="mb-4">
                        <Text className="text-primary font-medium mb-2">Email</Text>
                        <TextInput 
                            className="w-full bg-surface p-4 rounded-xl text-primary" 
                            placeholder="user@example.com" 
                            autoCapitalize="none" 
                            value={emailAddress} 
                            onChangeText={setEmailAddress}
                            keyboardType="email-address"
                        />
                        {errors.fields.identifier && (
                            <Text className="text-red-500 text-sm mt-1">{errors.fields.identifier.message}</Text>
                        )}
                    </View>

                    <View className="mb-6">
                        <Text className="text-primary font-medium mb-2">Password</Text>
                        <TextInput 
                            className="w-full bg-surface p-4 rounded-xl text-primary" 
                            placeholder="********" 
                            secureTextEntry 
                            value={password} 
                            onChangeText={setPassword} 
                        />
                        {errors.fields.password && (
                            <Text className="text-red-500 text-sm mt-1">{errors.fields.password.message}</Text>
                        )}
                    </View>

                    <Pressable 
                        className={`w-full py-4 rounded-full items-center mb-10 ${isLoading ? "bg-gray-300" : "bg-primary"}`} 
                        onPress={onSignInPress} 
                        disabled={isLoading || !emailAddress || !password}
                    >
                        {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Sign In</Text>}
                    </Pressable>

                    <View className="flex-row justify-center">
                        <Text className="text-secondary">Create new account? </Text>
                        <Link href="/sign-up"><Text className="text-primary font-bold">Sign up</Text></Link>
                    </View>
                </>
            ) : (
                <>
                    <View className="items-center mb-8">
                        <Text className="text-3xl font-bold text-primary mb-2">Verify Email</Text>
                        <Text className="text-secondary text-center">Enter the code sent to your email</Text>
                    </View>

                    <TextInput 
                        className="w-full bg-surface p-4 rounded-xl text-primary text-center tracking-widest mb-6" 
                        placeholder="123456" 
                        keyboardType="number-pad" 
                        value={code} 
                        onChangeText={setCode} 
                    />
                    {errors.fields.code && (
                        <Text className="text-red-500 text-sm mb-4 text-center">{errors.fields.code.message}</Text>
                    )}

                    <Pressable 
                        className={`w-full py-4 rounded-full items-center mb-4 ${isLoading ? "bg-gray-300" : "bg-primary"}`}
                        onPress={onVerifyPress} 
                        disabled={isLoading}
                    >
                        {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Verify</Text>}
                    </Pressable>

                    <Pressable onPress={() => signIn.mfa.sendEmailCode()}>
                        <Text className="text-primary text-center mb-2">I need a new code</Text>
                    </Pressable>

                    <Pressable 
                    onPress={() => {
                            signIn.reset();
                            setShowEmailCode(false);
                            setCode("");
                         }}
>
                        <Text className="text-secondary text-center">Start over</Text>
                    </Pressable>
                </>
            )}
        </SafeAreaView>
    );
}