import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import auth from '@react-native-firebase/auth';


export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.jsss to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
