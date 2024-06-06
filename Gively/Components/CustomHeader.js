import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, DrawerActions } from '@react-navigation/native';

const CustomHeader = () => {
  const navigation = useNavigation();

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, paddingTop: 60, backgroundColor: '#fff' }}>
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={{ paddingLeft: 10 }}>
        <Icon name="menu" size={30} color='#1C5AA3' />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Nofications')} style={{ paddingRight: 10 }}>
        <Icon name="notifications" size={30} color='#1C5AA3' />
      </TouchableOpacity>
    </View>
  );
};

export default CustomHeader;
