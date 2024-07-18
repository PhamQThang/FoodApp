import React, { useEffect, useState } from "react";
import { NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, Dimensions, Image, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Footer from "../../components/Footer";
import firestore from '@react-native-firebase/firestore';

interface Props {
    navigation: NavigationProp<any>;
    route: any;
}

const Information: React.FC<Props> = ({ navigation, route }) => {
    const [username, setUsername] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const { data } = route.params;

    const handleSaveUser = async () => {
        await firestore().collection('users').doc(data.userID).update({
            name: username,
            phone: phoneNumber,
            address: address,
        });

        Alert.alert("Cập nhật thông tin thành công");
        loadUserData();
    };

    const loadUserData = async () => {
        const userDoc = await firestore().collection('users').doc(data.userID).get();
        const userData = userDoc.data();
        if (userData) {
            setUsername(userData.name || '');
            setPhoneNumber(userData.phone || '');
            setAddress(userData.address || '');
        }
    };

    useEffect(() => {
        if (data !== 'default') {
            loadUserData();
        }
    }, [data]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior="padding"
                keyboardVerticalOffset={80}>
                <View style={styles.content}>
                    <Image source={require('../../../src/assets/images/footer.png')} style={styles.image} />
                    <View style={styles.container}>
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
                            <TouchableOpacity style={styles.button} onPress={handleSaveUser}>
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={() => navigation.navigate('Login', { data: 'Default' })}>
                                <Text style={styles.buttonText}>Đăng Xuất</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
            <Footer navigation={navigation} data={data} />
        </SafeAreaView>
    );
}

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    content: {
        flex: 1,
    },
    image: {
        width: windowWidth,
        height: 150,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    inputFrame: {
        borderRadius: 10,
        backgroundColor: '#fff',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    button: {
        height: 50,
        backgroundColor: '#007BFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginBottom: 15,
    },
    logoutButton: {
        backgroundColor: '#FF6347',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Information;
