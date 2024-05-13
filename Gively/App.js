import 'react-native-gesture-handler';
import React from 'react';
import { View, Alert, Button} from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import CreateAccountScreen from './Screens/CreateAccountScreen';
import HomeScreen from './Screens/HomeScreen'
import LoginScreen from './Screens/LoginScreen'
import SplashScreen from './Screens/SplashScreen'
import DiscoverScreen from './Screens/DiscoverScreen'
import FriendsListScreen from './Screens/FriendsListScreen'
import ProfileScreen from './Screens/ProfileScreen'
import AboutUsScreen from './Screens/AboutUsScreen'
import ContactUsScreen from './Screens/ContactUsScreen'
import FAQScreen from './Screens/FAQScreen'
import SettingScreen from './Screens/SettingScreen'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList} from '@react-navigation/drawer';
import { useFonts } from 'expo-font';

import { AuthProvider, useAuth } from './services/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

//Core App Pages Tab Navigator
function MainApp() {
  return (
    <Tab.Navigator initialRouteName="Home " screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { display: shouldShowTabBar(route) ? 'flex' : 'none' }
    })}
    >
      <Tab.Screen name="Home " component={HomeScreenDrawer}/>
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Friends" component={FriendsListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}


//TO DO: Currently have "Home" and  "Home "(with a space) as 2 different page titles, need to find work around
function shouldShowTabBar(route) {
  // Get the current route name
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home ';

  // List of screens where you want to hide the tab bar
  const hideTabBarScreens = ['About Us', 'Contact Us', 'Help & FAQs']; // Add more screen names as needed

  return !hideTabBarScreens.includes(routeName);
}

//Home page main drawer sign out handler
function CustomDrawerContent(props) {
  const { signOut } = useAuth(); // Destructure signOut from the context

  const handleSignOut = async () => {
    await signOut();
    Alert.alert("Signed Out", "You have been successfully signed out.");
    props.navigation.navigate('Splash'); // Navigate to splash screen after sign-out
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <View style={{padding: 20}}>
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    </DrawerContentScrollView>
  );
}

function HomeScreenDrawer() {
  return (
    <Drawer.Navigator initialRouteName="Home " drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="About Us" component={AboutUsScreen} />
      <Drawer.Screen name="Contact Us" component={ContactUsScreen} />
      <Drawer.Screen name="Settings" component={SettingScreen} />
      <Drawer.Screen name="Help & FAQs" component={FAQScreen} />
    </Drawer.Navigator>
  );
}

//Login Flow Navigation into the Main App
function RootNavigator() {
  const { user, loading, isSigningUp } = useAuth();

  if (loading) {
    return null; // Or a loading spinner if you prefer
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      {user && !isSigningUp && (
        <Stack.Screen name="Home" component={MainApp} />
      )}
    </Stack.Navigator>
  );
}

function App() {
  let [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('./assets/Fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Medium': require('./assets/Fonts/Montserrat/static/Montserrat-Medium.ttf'),
    'Montserrat-Bold': require('./assets/Fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null; // Or a loading screen/spinner until the fonts are loaded
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

export default App;
