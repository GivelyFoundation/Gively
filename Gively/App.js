import React, { useEffect } from 'react';
import { View, Alert, Button, Image, TouchableOpacity, Text } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import * as Notifications from 'expo-notifications'; 

// assets
import { useFonts } from 'expo-font';
import homeIcon from './assets/Icons/Home.png'
import discoverIcon from './assets/Icons/Discover.png'
import friendsIcon from './assets/Icons/Friends.png'
import profileIcon from './assets/Icons/Profile.png'
import notificationIcon from './assets/Icons/notificationIcon.png'

// screen imports
import CreateAccountScreen from './Screens/CreateAccountScreen';
import HomeScreen from './Screens/HomeScreen'
import LoginScreen from './Screens/LoginScreen'
import SplashScreen from './Screens/SplashScreen'
import DiscoverScreen from './Screens/DiscoverScreen'
import ConnectScreen from './Screens/ConnectScreen'
import ProfileScreen from './Screens/ProfileScreen'
import AboutUsScreen from './Screens/AboutUsScreen'
import ContactUsScreen from './Screens/ContactUsScreen'
import FAQScreen from './Screens/FAQScreen'
import SettingsScreen from './Screens/SettingsScreen'
import DonationHistoryScreen from './Screens/DonationHistoryScreen';
import PetitionScreen from './Screens/PetitionScreen';
import GoFundMeScreen from './Screens/GoFundMeScreen';
import FavoriteScreen from './Screens/FavoritesScreen';
import EditProfileScreen from './Screens/EditProfileScreen';
import UserScreen from './Screens/UserScreen';
import CharityDetailedScreen from './Screens/CharityDetailsScreen';
import SinglePostScreen from './Screens/SinglePostScreen';
import LearningScreen from './Screens/LearningScreen';
import BlogPostScreen from './Screens/BlogPostScreen';
import FollowersList from './Screens/FollowersList';
import FollowingList from './Screens/FollowingList';
import CustomHeader from './Components/CustomHeader';
import VolunteerScreen from './Screens/VolunteerScreen';
import NotificationsScreen from './Screens/NotificationsScreen';

// custom imports
import { AuthProvider, useAuth } from './services/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
  }),
});

const handleNotificationResponse = (response) => {
  console.log('Notification tapped:', response.notification.request.content.data);
  
  // Get the navigation reference
  const navigationRef = global.navigationRef;

  // Simply navigate to notifications screen for all notification types
  if (navigationRef) {
      navigationRef.navigate('Notifications');
  }
};

//Core App Pages Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="HomeDrawer"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3FC032',
        tabBarInactiveTintColor: '#8484A9',
        tabBarStyle: {
          display: shouldShowTabBar(route) ? 'flex' : 'none',
          borderTopWidth: 0
        },
        tabBarLabelStyle: { 
          fontSize: 12, 
          fontFamily: 'Montserrat-Medium' 
        }
      })}
    >
      <Tab.Screen
        name="HomeDrawer"
        component={HomeScreenDrawer}
        options={{
          tabBarLabel: 'Home',
          tabBarLabelStyle: { fontSize: 12, fontFamily: 'Montserrat-Medium' },
          tabBarIcon: ({ size, focused }) => {
            return (
              <Image
                style={{ width: size, height: size, tintColor: focused ? '#3FC032' : '#8484A9' }}
                source={homeIcon}
              />
            );
          }
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarLabelStyle: { fontSize: 12, fontFamily: 'Montserrat-Medium' },
          tabBarIcon: ({ size, focused }) => {
            return (
              <Image
                style={{ width: size, height: size, tintColor: focused ? '#3FC032' : '#8484A9' }}
                source={discoverIcon}
              />
            );
          }
        }} />
      <Tab.Screen name="Connect"
        component={ConnectScreen}
        options={{
          tabBarLabelStyle: { fontSize: 12, fontFamily: 'Montserrat-Medium' },
          tabBarIcon: ({ size, focused }) => {
            return (
              <Image
                style={{ width: size, height: size, tintColor: focused ? '#3FC032' : '#8484A9' }}
                source={friendsIcon}
              />
            );
          }
        }} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabelStyle: { fontSize: 12, fontFamily: 'Montserrat-Medium' },
          tabBarIcon: ({ size, focused }) => {
            return (
              <Image
                style={{ width: size, height: size, tintColor: focused ? '#3FC032' : '#8484A9' }}
                source={profileIcon}
              />
            );
          }
        }} />
    </Tab.Navigator>
  );
}

//TO DO: Currently have "Home" and  "Home "(with a space) as 2 different page titles, need to find work around
function shouldShowTabBar(route) {
  // Get the current route name
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeScreen';

  // List of screens where you want to hide the tab bar
  const hideTabBarScreens = ['About Us', 'Contact Us', 'Help & FAQs']; // Add more screen names as needed

  return !hideTabBarScreens.includes(routeName);
}

//Home page main drawer sign out handler
function CustomDrawerContent(props) {
  const { signOut, loading } = useAuth(); 

  const handleSignOut = async () => {
    if (loading) return; // Prevent multiple sign-out attempts

    await signOut();
    Alert.alert("Signed Out", "You have been successfully signed out.");
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <View style={{ padding: 20 }}>
      <Button 
          title={loading ? "Signing Out..." : "Sign Out"} 
          onPress={handleSignOut}
          disabled={loading}
        />
      </View>
    </DrawerContentScrollView>
  );
}

function HomeScreenDrawer() {
  return (
    <Drawer.Navigator initialRouteName="HomeScreen" drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ 
          header: () => <CustomHeader />,
          title: 'Home'
        }} 
      />
      <Drawer.Screen name="Learning" component={LearningScreen} />
      <Drawer.Screen name="Favorites" component={FavoriteScreen} />
      <Drawer.Screen name="Donation History & Tax Form" component={DonationHistoryScreen} />
      <Drawer.Screen name="About Us" component={AboutUsScreen} />
      <Drawer.Screen name="Contact Us" component={ContactUsScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Help & FAQs" component={FAQScreen} />
    </Drawer.Navigator>
  );
}

//Login Flow Navigation into the Main App
function RootNavigator() {
  const { user, loading, isSigningUp } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user && !isSigningUp ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Petition" component={PetitionScreen} />
          <Stack.Screen name="GoFundMe" component={GoFundMeScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="UserScreen" component={UserScreen} /> 
          <Stack.Screen name="CharityDetailedScreen" component={CharityDetailedScreen} /> 
          <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{
                  animation: 'slide_from_right',
                  gestureEnabled: true,
                  gestureDirection: 'horizontal'
              }}
          />
          <Stack.Screen name="SinglePostScreen" component={SinglePostScreen}/>
          <Stack.Screen name="LearningScreen" component={LearningScreen} />
          <Stack.Screen name="BlogPostScreen" component={BlogPostScreen} />
          <Stack.Screen name="VolunteerScreen" component={VolunteerScreen} />
          <Stack.Screen
            name="FollowersList"
            component={FollowersList}
            options={{ title: 'Followers' }}
          />
          <Stack.Screen
            name="FollowingList"
            component={FollowingList}
            options={{ title: 'Following' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        </>
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

  // Set up notification handler
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
    );

    return () => subscription.remove();
  }, []);

  // Reference for navigation from outside components
  const navigationRef = React.useRef(null);
  global.navigationRef = navigationRef;

  if (!fontsLoaded) {
    return null; // Or a loading screen/spinner until the fonts are loaded
  }

  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

export default App;
