import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SwitchSelector from "react-native-switch-selector";
import styles from '../Styles.js/Styles';


const ForYouFeed = () => {
  return (
    <View style={styles.container}>
      <Text>{`For You Feed`}</Text>
    </View>
  );
};

const FriendsFeed = () => {
  return (
    <View style={styles.container}>
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
    <View>
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
      />
      {activeTab === 'For You' ? < ForYouFeed /> : <FriendsFeed />}
    </View>
  );
}
