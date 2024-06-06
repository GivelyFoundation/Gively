import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const VolunteerPreview = ({ data }) => {
    if (!data) {
        return null;
    }

    return (
            
        <View style={styles.container}>
            
            <Text style={styles.text}>Description: {data.description}</Text>
            <Text style={styles.text}>Date: {data.eventDate}</Text>
            <Text style={styles.text}>Address: {data.address}</Text>
            <View style={styles.mapView}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: data.location.latitude,
                        longitude: data.location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    <Marker
                        coordinate={{ latitude: data.location.latitude, longitude: data.location.longitude }}
                        title={data.address}
                    />
                </MapView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 10,
        marginVertical: 10,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    text: {
        fontSize: 14,
        marginBottom: 5,
    },
    mapView: {
        width: '100%',
        height: 150,
        marginTop: 10,
    },
    map: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
});

export default VolunteerPreview;
