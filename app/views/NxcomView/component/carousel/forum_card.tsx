import React from 'react';
import {Image, Linking, StyleSheet, Text, View} from 'react-native';

const ForumCard = ({item}: { item: any }) => {
    return (
        <View style={styles.container}>
            <Image
                source={{uri: item.logo_url}}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text
                style={styles.link}
                onPress={() => Linking.openURL(item.site)}
            >
                {item.site.replace(/https?:\/\//, '')}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 300,
        height: 400,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    logo: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 15,
    },
    link: {
        color: '#007AFF',
        fontSize: 14,
    },
});

export default ForumCard;