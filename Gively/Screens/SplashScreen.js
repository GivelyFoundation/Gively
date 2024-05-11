import React from 'react';
import { View, Text, Pressable, ImageBackground } from 'react-native';

export default function SplashScreen({ navigation }) {
  return (
    <ImageBackground source={require('../assets/Images/splash-1.png')} resizeMode="cover" className="flex-1">
      <View className="flex-1 justify-center items-center p-4 bg-opacity-50 bg-black">
        <Text className="text-white text-3xl font-bold mb-2">Welcome!</Text>
        <Text className="text-white text-lg mb-8">Makes Having A Social Impact Easy</Text>
        <Pressable className="bg-green-500 w-full py-3 rounded-full items-center mb-4" onPress={() => navigation.navigate('CreateAccount')}>
          <Text className="text-white text-lg">Create Account</Text>
        </Pressable>
        <Pressable className="bg-transparent w-full py-3 rounded-full border border-white items-center" onPress={() => navigation.navigate('Login')}>
          <Text className="text-white text-lg">Login</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}
