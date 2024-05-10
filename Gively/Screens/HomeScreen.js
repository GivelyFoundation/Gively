import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SwitchSelector from "react-native-switch-selector";
import styles from '../Styles.js/Styles';


const ForYouFeed = () => {
  return (
    <View style={[styles.container, styles.page]}>
      <Text>{`For You Feed`}</Text>
    </View>
  );
};
const FriendsFeed = () => {
  return (
    <View style={[styles.container, styles.page]}>
      <Text>{`Friends Feed`}</Text>
    </View>
  );
};

export default function HomeFeedScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('For You');

  // Update activeTab based on the selected value from SwitchSelector
  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  return (
    <View style={[styles.container, styles.page]}>
      <SwitchSelector
        initial={0}
        onPress={value => handleTabPress(value)}
        hasPadding
        options={[
          { label: "For You", value: "For You" },
          { label: "Friends", value: "Friends" }
        ]}
        testID="feed-switch-selector"
        accessibilityLabel="feed-switch-selector"
        style={[homeStyles.switchStyle]}
        selectedColor={'#1C5AA3'}
        buttonColor={'rgba(28, 90, 163, 0.1)'}
        borderColor={'#1C5AA3'}
        fontSize={16}
        height={30}
      />
      {activeTab === 'For You' ? < ForYouFeed /> : <FriendsFeed />}
      
    </View>
  );
}

const homeStyles = StyleSheet.create({
  switchStyle: {
    paddingTop: 10,
    paddingHorizontal: 30,
  },
})
