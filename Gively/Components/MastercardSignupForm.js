import { StyleSheet, Text, View, Pressable } from 'react-native'
import React from 'react'

export default function MastercardSignupForm({nextStep}) {

    function handlePress(){
        nextStep()
    }
  return (
    <View>
        <Pressable onPress={handlePress}>
            <Text>MastercardSignupForm</Text>
        </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({})