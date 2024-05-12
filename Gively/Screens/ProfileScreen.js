
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import SwitchSelector from "react-native-switch-selector";
import CharityCard from '../Components/CharityCard';
import { charities, user, charityData } from '../MockData';
import styles from '../Styles.js/Styles';
import PinnedCharityCard from '../Components/PinnedCharityCard';

const profilePicture = require('../assets/Images/profileDefault.png');
const pieChartPlaceHolder = require('../assets/Images/pieChartPlaceHolder.png')

const CharityInfoComponent = ({ charityName, color, percentage }) => {
  return (
    <View style={profileStyles.charityCardInfoContainer}>
      <Text style={[profileStyles.charityName, { color: color }, {fontFamily: 'Montserrat-Medium'}]}>{charityName}</Text>
      <Text style={[profileStyles.percentage, {fontFamily: 'Montserrat-Medium'}]}>{percentage}%</Text>
    </View>
  );
};


const Portfolio = () => {
  return (
    <View style={[profileStyles.portfolioContainer, styles.page]}>
      <Image source={pieChartPlaceHolder} style={profileStyles.pieChartPlaceHolder} />
      <ScrollView>
      {charityData.map((charity, index) => (
          <CharityInfoComponent key={index} charityName = {charity.charityName} color = {charity.color} percentage={charity.percentage}/>
        ))}
      </ScrollView>
     </View>
  );
};
const Favorites = () => {
  return (
    <View style={[profileStyles.contentContainer, styles.page]} >
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[profileStyles.scrollView]} >
        {charities.map((charity, index) => (
          <CharityCard key={index} charity={charity} />
        ))}
      </ScrollView>
    </View>
  );
};




const CategoryScroll = () => {

  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={profileStyles.interestContainer}
    >
      {user.interests.map((category, index) => (
        <TouchableOpacity key={index} style={profileStyles.interestButton}>
          <Text style={[profileStyles.interestButtonText, { fontFamily: 'Montserrat-Medium' }]}>{category}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Portfolio');


  // Update activeTab based on the selected value from SwitchSelector
  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  return (
    <View style={styles.page}>

      <View style={[profileStyles.header]}>

        <Text style={[profileStyles.headerText, { fontFamily: 'Montserrat-Medium' }]}>Profile</Text>


        <TouchableOpacity>

          <Text style={[profileStyles.editProfile, profileStyles.buttonText, { fontFamily: 'Montserrat-Medium' }]}>Edit Profile </Text>

        </TouchableOpacity>

      </View>

      <View style={[profileStyles.row, profileStyles.profileInfo]}>

        <Image source={profilePicture} style={profileStyles.profilePicture} />

        <View style={[profileStyles.column]}>

          <Text style={[profileStyles.userNameText, { fontFamily: 'Montserrat-Medium' }]}> {user.username}</Text>

          <View style={[profileStyles.followRow]}>

            <View style={[profileStyles.column]}>

              <TouchableOpacity>

                <Text style={[profileStyles.followText, profileStyles.buttonText, { fontFamily: 'Montserrat-Medium' }]}>{user.followers} </Text>

              </TouchableOpacity>


              <Text style={[profileStyles.followText, { fontFamily: 'Montserrat-Medium' }]}>Followers</Text>

            </View>

            <View style={profileStyles.verticalLine} />

            <View style={[profileStyles.column]}>

              <TouchableOpacity>

                <Text style={[profileStyles.followText, profileStyles.buttonText, { fontFamily: 'Montserrat-Medium' }]}>{user.following} </Text>

              </TouchableOpacity>

              <Text style={[profileStyles.followText, { fontFamily: 'Montserrat-Medium' }]}>Following</Text>

            </View>

          </View>

        </View>

        <View style={[profileStyles.row]}>

        </View>

      </View>

      <Text style={[profileStyles.bioHeader, { fontFamily: 'Montserrat-Medium' }]}> {user.bioHeader} </Text>

      <Text style={[profileStyles.bioMainText, { fontFamily: 'Montserrat-Medium' }]}> {user.mainBioText}</Text>

      <CategoryScroll />

     {/* < View style={profileStyles.horizontalLine} /> */}
     <PinnedCharityCard username= {user.username.split(" ")[0]} charity={"Nami"} reason= {"Help me raise money for mental health awareness!"}/>
    

      <SwitchSelector
        initial={0}
        onPress={value => handleTabPress(value)}
        hasPadding
        options={[
          { label: "Portfolio", value: "Portfolio" },
          { label: "Favorites", value: "Favorites" }
        ]}
        testID="feed-switch-selector"
        accessibilityLabel="feed-switch-selector"
        style={[profileStyles.switchStyle]}
        selectedColor={'#1C5AA3'}
        buttonColor={'#fff'}
        backgroundColor={'#F5F5F5'}
        borderColor={"#AFB1B3"}
        textColor = {"#AFB1B3"}
        fontSize={16}
        height={30}
      />
      {activeTab === 'Portfolio' ? < Portfolio /> : <Favorites />}
    </View>
    
  );
}

const profileStyles = StyleSheet.create({
  header: {
    paddingTop: 70,
    flexDirection: 'row', // Align children horizontally
    alignItems: 'center', // Align children vertically in the center
    width: '100%', // Ensure the row takes full width of the screen
    justifyContent: 'space-between',
    paddingRight: 20
  },
  row: {
    flexDirection: 'row', // Align children horizontally
    alignItems: 'center', // Align children vertically in the center
  },
  followRow: {
    flexDirection: 'row', // Align children horizontally
    margin: 10,
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column', // Align children horizontally
    alignItems: 'center', // Align children vertically in the center,
  },
  followColumn: {
    flexDirection: 'column', // Align children horizontally
    alignItems: 'center', // Align children vertically in the center,
    marginRight: 80
  },
  userNameText: {
    fontSize: 24,
  },
  followText: {
    fontSize: 16,
    color: '#747688'
  },
  profileInfo: {
    width: '100%',
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    justifyContent: 'space-between'
  },
  headerText: {
    paddingLeft: 30,
    fontSize: 24
  },
  editProfile: {
    fontSize: 16
  },
  verticalLine: {
    height: '70%', // Adjust height to control the line's length relative to the row height
    alignContent: 'center',
    width: 1, // The thickness of the line
    backgroundColor: '#DDDDDD', // Line color
    marginHorizontal: 20, // Space around the line
  },
  horizontalLine: {
    height: 1, // Line thickness
    backgroundColor: '#cccccc', // Line color, light grey
    marginTop: 20,
    marginBottom: 5,
    marginHorizontal: 30,
  },
  profilePicture: {
    width: 100, // Set the width as needed
    height: 100, // Set the height as needed
  },
  pieChartPlaceHolder:{
    width: 150, // Set the width as needed
    height: 150, // Set the height as needed
    alignItems: 'center', // Center items horizontally
    alignSelf: 'center',
  },
  buttonText: {
    color: '#1C5AA3',
    fontFamily: ''
  },
  bioHeader: {
    fontSize: 15,
    padding: 30,
    paddingVertical:10,
    paddingBottom: 10,
    textTransform: 'uppercase',
    color: '#1E1E1E'
  },
  bioMainText: {
    fontSize: 16,
    paddingHorizontal: 30,
    lineHeight: 25,
    color: '#747688'
  },
  interestContainer: {
    alignItems: 'center',
    padding: 10,
    paddingBottom:20,
    paddingHorizontal: 30
  },
  interestButton: {
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 20,
    marginRight: 10,
    backgroundColor: 'rgba(28, 90, 163, 0.1)',
  },
  interestButtonText: {
    color: '#1C5AA3',
    fontSize: 16,
    opacity: .9
  },
  switchStyle: {
    paddingTop: 10,
    paddingHorizontal: 30,
  },
  contentContainer: {
    alignContent: 'center',
    paddingTop: 10,
    backgroundColor: '#fff',
    height: 1000
  },
  scrollView: {
    flexGrow: 1,
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 30,
  },
  portfolioContainer:{
    alignContent: 'center',
    paddingTop: 20,
    backgroundColor: '#fff',
    height: 1000
  },
  charityCardInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal:30,
    marginTop: 10,
  },
  charityName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '500',
  }
});
