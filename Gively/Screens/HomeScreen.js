import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView  } from 'react-native';
import SwitchSelector from "react-native-switch-selector";
import styles from '../Styles.js/Styles';
import DonationCard from '../Components/DonationCard';
import { PetitionCard } from '../Components/PetitionCard';
import { GoFundMeCard } from '../Components/GoFundMeCard';
import { postsData, postsData2, user } from '../MockData';

import WelcomeCard from '../Components/WelcomeCard';

const ForYouFeed = () => {
  // Function to select the appropriate card based on postType
  const renderCard = (item) => {
    switch (item.postType) {
      case 'donation':
        return <DonationCard key={item.id} data={item} />;
      case 'petition':
        return <PetitionCard key={item.id} data={item} user = {user}/>;
      case 'gofundme':
        return <GoFundMeCard key={item.id} data={item} user = {user}/>;
      default:
        return <View key={item.id}><Text>Unknown Post Type</Text></View>;
    }
  };

  return (
    <View style={[styles.container, styles.page]}>
      <ScrollView>
        <View style={{ padding: 10 }}>
          {postsData2.map((item) => renderCard(item))}
        </View>
      </ScrollView>
    </View>
  );
};
const FriendsFeed = () => {
  // Function to select the appropriate card based on postType
  const renderCard = (item) => {
    switch (item.postType) {
      case 'donation':
        return <DonationCard key={item.id} data={item} />;
      case 'petition':
        return <PetitionCard key={item.id} data={item} user = {user}/>;
      case 'gofundme':
        return <GoFundMeCard key={item.id} data={item} user = {user}/>;
      default:
        return <View key={item.id}><Text>Unknown Post Type</Text></View>;
    }
  };

  return (
    <View style={[styles.container, styles.page]}>
      <ScrollView>
        <View style={{ padding: 10 }}>
          {postsData2.map((item) => renderCard(item))}
        </View>
      </ScrollView>
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
       <WelcomeCard username="Andy" donationAmount={2515} charityCount={25} />
    
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
        buttonColor={'#fff'}
        backgroundColor={'#F5F5F5'}
        textColor = {"#AFB1B3"}
        borderColor={"#AFB1B3"}
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
    paddingBottom:20
  },
})
