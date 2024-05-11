import React from 'react';
import { View, Text, Pressable, ImageBackground, StyleSheet } from 'react-native';
import { Image } from 'react-native';

export default function SplashScreen({ navigation }) {
  return (
    <ImageBackground 
      source={require('../assets/Images/splash-1.png')} 
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 justify-between p-4 bg-black " style={styles.overlay}>
        <View className="pt-20">
          <Image
            source={require('../assets/Images/logo-1.png')} 
            style={{ width: 100, height: 100, alignSelf: 'center' }} // Customize size as needed
            resizeMode="contain"
          />
          <Text className="text-white text-3xl font-bold mb-2 text-center mt-4">Welcome!</Text>
          <Text className="text-white text-lg mb-2 text-center">Makes Having A Social Impact Easy</Text>
        </View>
        <View className="pb-20">
          <Pressable className="bg-green-500 py-3 w-11/12 max-w-xs rounded-full items-center mb-4 self-center" onPress={() => navigation.navigate('CreateAccount')}>
            <Text className="text-white text-lg">Create Account</Text>
          </Pressable>
          <Pressable className="bg-white py-3 w-11/12 max-w-xs rounded-full border border-white items-center self-center" onPress={() => navigation.navigate('Login')}>
            <Text className="text-black text-lg">Login</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  }
});