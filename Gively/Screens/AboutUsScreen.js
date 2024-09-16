import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';


const profilePicture = require('../assets/Images/profileDefault.png');
const textAndImageLogo = require('../assets/Images/TextAndImageLogo.png');

export default function AboutUsScreen({ navigation }) {
  return (
    <ScrollView style={[styles.container, styles.page]}>
     <Image source={ textAndImageLogo } style={styles.logo} />
      
      <Text style={[styles.headerText, {fontFamily: 'Montserrat-Bold'}]}>Discover Gively: Empowering Friends To Give Together</Text>
      <Text style={[styles.infoText, {fontFamily: 'Montserrat-Medium'}]}>
      Our mission is to foster a global community of giving through our app, empowering friends to effortlessly discover, donate to, and share impactful charities. By connecting individuals with causes they care about, we aim to inspire collective action and create positive change in the world.
      </Text>
      <FindNonProfits/>
      <FriendsDonations/>
      <FeeCommitment/>
      <Text style={[styles.headerText, {fontFamily: 'Montserrat-Bold'}]}>Our Team</Text>
      <DeveloperProfile
        name="Andy Abebaw"
        role="Co-founder & UI/UX Designer"
        profilePic={profilePicture}
        bio="Andy brings his vast experience from various tech giants to lead the development of Gively. He focuses on designing intuitive user interfaces and ensuring a seamless user experience. Andy's dedication to philanthropy and technology drives the innovative approach behind Gively, aiming to make charitable giving accessible and engaging for everyone. His journey through overcoming mental health challenges has inspired him to create tools that empower others to make a positive impact in the world."
      />
      <DeveloperProfile
        name="Ben Lee"
        role="Co-founder & Lead Developer"
        profilePic={profilePicture}
        bio="Ben's expertise in design and user experience helps in making Gively a visually appealing and easy-to-use platform. He leads the development team, ensuring that the app is not only functional but also enjoyable to use. Ben's background in design and development fuels his passion for creating intuitive and impactful solutions that enhance the user experience and make charitable giving more accessible."
      />
    </ScrollView>
  );
};


const FeeCommitment = () => (
  <View style={styles.section}>
    <Text style={[styles.header, {fontFamily: 'Montserrat-Bold'}]}>No Fees. 100% Of Donations Go To Charity.</Text>
    <Text style={[styles.content, {fontFamily: 'Montserrat-Medium'}]}>
      Our commitment is simple: zero fees and 100% of your donation goes directly
      to the charity of your choice. With transparency at our core, we ensure that
      every contribution made through our app has maximum impact, empowering users
      to give confidently and make a difference without any deductions or hidden costs.
    </Text>
  </View>
);

const FindNonProfits = () => (
  <View style={styles.section}>
    <Text style={[styles.header,{fontFamily: 'Montserrat-Bold'}]}>
      Find NonProfits Supporting Causes You Care About!
    </Text>
    <Text style={[styles.content, {fontFamily: 'Montserrat-Medium'}]}>
      Our app simplifies the search for charities aligned with your passions. With
      user-friendly tools and curated recommendations, discovering causes you care
      about becomes effortless. Whether it's environmental conservation, education,
      or humanitarian aid, we streamline the process, ensuring every user can easily
      find and support charities that resonate with their values.
    </Text>
  </View>
);

const FriendsDonations = () => (
  <View style={styles.section}>
    <Text style={[styles.header,{fontFamily: 'Montserrat-Bold'}]}>
      See Where Your Friends Donate And Join The Effort.
    </Text>
    <Text style={[styles.content,{fontFamily: 'Montserrat-Medium'}]}>
      Our app empowers users by offering transparency and connection. Through intuitive
      features, users can see where their friends donate, fostering a sense of community
      and inspiring them to join the effort. By providing visibility into charitable actions,
      we encourage collaboration and amplify the impact of collective giving.
    </Text>
  </View>
);

const DeveloperProfile = ({ name, role, profilePic, bio }) => {
  return (
    <View style={styles.profileCard}>
      <Image source={ profilePic } style={styles.profileImage} />
      <View style={styles.profileText}>
        <Text style={[styles.nameText, {fontFamily: 'Montserrat-Bold'}]}>{name}</Text>
        <Text style={[styles.roleText,{fontFamily: 'Montserrat-Medium'}]}>{role}</Text>
        <Text style={[styles.bioText, {fontFamily: 'Montserrat-Medium'}]}>{bio}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  page: {
    backgroundColor: '#fff'
  },
  headerText: {
    fontSize: 22,
    marginTop: 20,
    marginBottom: 10,
    color: '#3FC032',
    fontWeight:'bold'
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
    shadowColor: '#5A5A5A',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },
  logo: {
    width:200,
    height: 200,
    alignSelf:'center',

  resizeMode: 'contain',
  },
  profileText: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom:10
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 5,
    paddingBottom:10
  },
  bioText: {
    fontSize: 14,
    color: '#666',
lineHeight :20
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    paddingVertical: 10
  },
  content: {
    fontSize: 16,
    color: '#666',
  }
});