import React, { useState } from "react";
import Icon from 'react-native-vector-icons/Fontisto';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Dimensions, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import Footer from "../../components/Footer";

interface Props {
    navigation: NavigationProp<any>;
    route: any
}

const Information: React.FC<Props> = ({ navigation, route }) => {
    const [username, setUsername] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [avatar, setAvatar] = useState(null);
    const {data} = route.params || { data: 'Default Value' };

    const selectImage = () => {
        launchImageLibrary({}, (response) => {
            if (response.assets && response.assets.length > 0) {
                setAvatar(response.assets[0].uri);
            }
        });
    };

    const handleSave = () => {
        // Handle save logic here
        console.log({ username, address, phoneNumber, avatar });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
            style={styles.container}
            behavior="padding"
            keyboardVerticalOffset={80}>
            <View style={styles.content}>
                <Image source={require('../../../src/assets/images/footer.png')} style={styles.image} />
                <View style={styles.container}>
                    <TouchableOpacity onPress={selectImage}>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>Select Image</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <View style={styles.inputFrame}>
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            value={username}
                            onChangeText={setUsername}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Address"
                            value={address}
                            onChangeText={setAddress}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />
                        <TouchableOpacity style={styles.button} onPress={handleSave}>
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {/* footer */}

            </KeyboardAvoidingView>
            <Footer navigation={navigation} data={data}/>

        </SafeAreaView>
    );
}

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    image: {
        width: windowWidth,
        height: 150,
        backgroundColor: '#ccc',
    },
    container: {
        flex: 1,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
    },
    avatarPlaceholder: {
        marginTop: 20,
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        backgroundColor: '#cccccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#ffffff',
    },
    inputFrame: {
        paddingHorizontal: 20,
        marginTop: 20,
        borderRadius: 10,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    button: {
        height: 40,
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default Information;
