import { ApolloClient, InMemoryCache, gql, useQuery, createHttpLink, ApolloProvider } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
const logo = require('../assets/Images/redcross.png');
const profilePicture = require('../assets/Images/profileDefault.png');
const charityNavigatorLogo = require('../assets/Images/charityNavigatorLogo.png');
// Replace with your actual GraphQL endpoint and API key
const GRAPHQL_ENDPOINT = 'https://data.charitynavigator.org';
const API_KEY = 'stl8_d89fd8c5770027b269fae295f7e5e7010835b871f6ea3e3d30d89e145cf8aaa5';

// Create an HTTP link to the GraphQL endpoint
const httpLink = createHttpLink({
    uri: GRAPHQL_ENDPOINT,
});

// Use setContext to add the API key to the headers
const authLink = setContext((_, { headers }) => {
    return {
        headers: {
            ...headers,
            'Stellate-Api-Token': API_KEY, // Use 'Stellate-Api-Token' for the API key
        }
    }
});

// Combine the auth link and the HTTP link
const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});

// Define the GraphQL query
const PUBLIC_SEARCH_FACETED = gql`
  query PublicSearchFaceted($term: String!) {
    publicSearchFaceted(term: $term) {
      size
      from
      term
      result_count
      results {
        ein
        name
        mission
        organization_url
        charity_navigator_url
        encompass_score
        encompass_star_rating
        encompass_publication_date
        cause
        street
        street2
        city
        state
        zip
        country
        highest_level_advisory
        encompass_rating_id
      }
    }
  }
`;

// Define the introspection query
const INTROSPECTION_QUERY = gql`
  query IntrospectionQuery {
    __schema {
      types {
        name
        kind
        description
        fields {
          name
          description
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
        inputFields {
          name
          description
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
        interfaces {
          name
        }
        enumValues {
          name
          description
        }
        possibleTypes {
          name
        }
      }
    }
  }
`;



const StarRating = ({ rating }) => {
    const totalStars = 4;
    const stars = [];

    for (let i = 0; i < totalStars; i++) {
        stars.push(
            <Icon
                key={i}
                name={i < rating ? "star" : "star-border"}
                size={30}
                color='#3FC032' // Gold color
            />
        );
    }
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
}

const ProfilePictureRow = ({ count }) => {
    // Create an array of the given count and map it to Image components
    const images = Array.from({ length: count }).map((_, index) => (
      <Image key={index} source={profilePicture} style={styles.friendsProfilePicture} />
    ));
  
    return (
      <View style={styles.friendsRow}>
        {images}
      </View>
    );
  };

// Create a component to perform the query
function CharityDetailedView({ term }) {
    const { loading, error, data } = useQuery(PUBLIC_SEARCH_FACETED, {
        variables: { term },
    });

    

    if (loading) return <Text style={{ fontFamily: 'Montserrat-Medium' }}>Loading...</Text>;
    if (error) {
        console.error('Error:', error);
        return <Text style={{ fontFamily: 'Montserrat-Medium' }}>Error! {error.message}</Text>;
    }

       

    return (
        <ScrollView style={styles.container}>
            {data.publicSearchFaceted.results.map((charity) => (
                <View key={charity.ein} style={styles.charityContainer}>
                    <Image source={logo} style={styles.logo} />
                    <View style={styles.row}>
                        <Text style={[styles.text, { fontFamily: 'Montserrat-Medium' }, styles.highlightedText]}>{charity.name}</Text>
                        <StarRating rating={charity.encompass_rating_id} />
                    </View>
                    <Text style={[styles.secondaryHeader, { fontFamily: 'Montserrat-Medium' }]}>Friends Who Donate Here:</Text>

                    <ProfilePictureRow count={5} />
                    
                    <Text style={[styles.header, { fontFamily: 'Montserrat-Medium' }]}>MISSION STATEMENT:</Text>
                    <Text style={[styles.text, { fontFamily: 'Montserrat-Medium' }]}>{charity.mission}</Text>
                    <Text style={[styles.header, { fontFamily: 'Montserrat-Medium' }]}>Organization URL:</Text>
                    <TouchableOpacity  onPress={() => Linking.openURL('https://' + charity.organization_url).catch((err) => console.error("Couldn't load page", err))} style={styles.websiteButton}>
        <Text style={styles.websiteText}>Click Here to Visit Their Website</Text>
      </TouchableOpacity>
                    <Text style={[styles.header, { fontFamily: 'Montserrat-Medium' }]}>Encompass Score:</Text>
                    <Text style={[styles.text, { fontFamily: 'Montserrat-Medium' }]}>{parseFloat(charity.encompass_score).toFixed(2)}</Text>
                    <Text style={[styles.header, { fontFamily: 'Montserrat-Medium' }]}>Cause:</Text>
                    <Text style={[styles.text, { fontFamily: 'Montserrat-Medium' }]}>{charity.cause}</Text>
                    <Text style={[styles.header, { fontFamily: 'Montserrat-Medium' }]}>Address:</Text>
                    <Text style={[styles.text, { fontFamily: 'Montserrat-Medium' }]}>{charity.street}, </Text>
                    <Text style={[styles.text, { fontFamily: 'Montserrat-Medium' }]}>{charity.city}, {charity.state} {charity.zip} {charity.country} </Text>
                </View>
            ))}
            <View style = {styles.poweredByContainer}>
                <Text style={[styles.poweredByText, { fontFamily: 'Montserrat-Medium' }]}> Powered By </Text>
            <Image   source={charityNavigatorLogo} style={styles.CNLogo} />
            </View>
            <View style={styles.spacer} />
            
        </ScrollView>
    );
}

// Create a component to perform the query
function SchemaIntrospection() {
    const { loading, error, data } = useQuery(INTROSPECTION_QUERY);
  
    if (loading) return <Text style={{ fontFamily: 'Montserrat-Medium' }}>Loading...</Text>;
    if (error) {
      console.error('Error:', error);
      return <Text style={{ fontFamily: 'Montserrat-Medium' }}>Error! {error.message}</Text>;
    }
  
    return (
      <ScrollView style={styles.container}>
        {data.__schema.types.map((type) => (
          <View key={type.name} style={styles.typeContainer}>
            <Text style={[styles.header, { fontFamily: 'Montserrat-Medium' }]}>{type.name}</Text>
            <Text style={[styles.text, { fontFamily: 'Montserrat-Medium' }]}>{type.description}</Text>
            {type.fields && (
              <>
                <Text style={[styles.subHeader, { fontFamily: 'Montserrat-Medium' }]}>Fields:</Text>
                {type.fields.map((field) => (
                  <View key={field.name} style={styles.fieldContainer}>
                    <Text style={[styles.fieldText, { fontFamily: 'Montserrat-Medium' }]}>{field.name} ({field.type.name || field.type.kind})</Text>
                    {field.description && <Text style={[styles.text, { fontFamily: 'Montserrat-Medium' }]}>{field.description}</Text>}
                  </View>
                ))}
              </>
            )}
          </View>
        ))}
      </ScrollView>
    );
  }
  

// Use the ApolloProvider to wrap your app
export default function CharityDetailedScreen({ navigation }) {
    return (
     
        <ApolloProvider client={client}>
            <View style={styles.wrapper}>
                <TouchableOpacity onPress={() => navigation.navigate("Discover")} style={styles.backButton}>
                    <Text style={[{ fontFamily: 'Montserrat-Medium' }, styles.backButtonText]}>Back</Text>
                </TouchableOpacity>
                <CharityDetailedView term="53-0196605" />
                
                <TouchableOpacity style={styles.donateButton}>
                    <Text style={styles.donateButtonText}>Donate</Text>
                </TouchableOpacity>
                {/* <SchemaIntrospection /> */}
            </View>
        </ApolloProvider>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#fff"
    },
    friendsRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      friendsProfilePicture: {
        width: 50, // Adjust the size as needed
        height: 50, // Adjust the size as needed
        marginHorizontal: 5, // Add some spacing between images
      },
      friendsWhoDonate:{
        paddingBottom: 20
      },
      poweredByContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        paddingTop: 20
      }, 
      CNLogo:{
        height:25,
        width: 200
      },
      poweredByText:{
        fontSize: 20
      },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 40,
    },
    logo: {
        height: 100,
        width: 300, 
        alignSelf: 'center'
    },
    backButton: {
        paddingTop: 60,
        paddingLeft: 20
    },
    backButtonText: {
        fontSize: 20
    },
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 40,
    },
    charityContainer: {
        marginBottom: 20,
    },
    header: {
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 10,
        paddingVertical: 10
    },

    secondaryHeader:{
        color: "#8C8A9A",
        fontSize: 16,
        marginTop: 10,
        paddingVertical: 10
    
    },
    text: {
        fontSize: 14,
        marginBottom: 5,
        lineHeight: 24
    },
    highlightedText: {
        fontSize: 24, // Increase text size for charity name
    },
    donateButton: {
        position: 'absolute',
        bottom: 20,
        left: '10%',
        right: '10%',
        backgroundColor: '#3FC032',
        padding: 15,
        alignItems: 'center',
        borderRadius: 10,
        elevation: 5, // Adds shadow for Android
        shadowColor: '#000', // Adds shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    donateButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    spacer: {
        height: 200
    },
    websiteButton:{
      backgroundColor: '#1C5AA3',
    padding: 10,
    borderRadius:10
    },
    websiteText:{
        color: "#fff",
        alignSelf:'center'
    }
});
