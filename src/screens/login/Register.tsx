import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, StatusBar, TextInput, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Fontisto';
import { StackNavigationProp } from '@react-navigation/stack';
import firestore from '@react-native-firebase/firestore';
import { RootStackParamList } from '../../../App';
import { colors } from '../../constaints/colors';

type ScreenANavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;
type Props = {
    navigation: ScreenANavigationProp;
};

const Register: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu không khớp');
            return;
        }

        try {
            // Kiểm tra xem email đã tồn tại trong Firestore chưa
             const emailExists = await checkEmailExists(email);
             if (emailExists) {
                 Alert.alert('Lỗi', 'Email đã tồn tại');
                 return;
             }
            // Lấy ID hiện tại lớn nhất
            const snapshot = await firestore().collection('users').orderBy('userID', 'desc').limit(1).get();
            let newUserID = 1;
            if (!snapshot.empty) {
                const lastUser = snapshot.docs[0].data();
                newUserID = parseInt(lastUser.userID) + 1;
            }

            // Thêm user mới với userID tự động tăng
            await firestore().collection('users').doc(newUserID.toString()).set({
                userID: newUserID.toString(),
                email: email,
                name: name,
                password: password,
                role: 'user', // Hoặc 'admin' nếu cần thiết
                address: '',
                phone: '',
                userIMG: ''
            });

            // Tạo giỏ hàng cho người dùng mới
            await firestore().collection('carts').doc(newUserID.toString()).set({
                cartID: newUserID.toString(),
                userID: newUserID.toString(),
                date: new Date().toISOString(),
            });

            Alert.alert('Thành công', 'Đăng ký thành công');
            navigation.navigate('Login', {data: 'default'});
        } catch (error) {
            console.error('Error registering user: ', error);
            Alert.alert('Lỗi', 'Không thể đăng ký');
        }
    };

    const checkEmailExists = async (email: string) => {
        const snapshot = await firestore().collection('users').where('email', '==', email).limit(1).get();
        return !snapshot.empty;
    };
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={colors.bgColor} barStyle={'dark-content'} />
            <Image source={require('../../../src/assets/images/footer.png')} style={styles.logo}/>
            <View style={styles.title}>
                <Text style={{ fontWeight: 'bold', fontSize: 30, color: 'black' }}>Đăng Ký</Text>
            </View>
            
            <View style={styles.form}>
                <View style={styles.group}>
                    <Icon name="email" style={styles.icon} />
                    <TextInput placeholder="Nhập Email" style={styles.input} value={email} onChangeText={setEmail} />
                </View>
    
                <View style={styles.group}>
                    <Icon name="male" style={styles.icon} />
                    <TextInput placeholder="Nhập Tên" style={styles.input} value={name} onChangeText={setName} />
                </View>

                <View style={styles.group}>
                    <Icon name="locked" style={styles.icon} />
                    <TextInput secureTextEntry={true} placeholder="Nhập Mật Khẩu" style={styles.input} value={password} onChangeText={setPassword} />
                </View>
    
                <View style={styles.group}>
                    <Icon name="locked" style={styles.icon} />
                    <TextInput secureTextEntry={true} placeholder="Nhập Lại Mật Khẩu" style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} />
                </View>
    
                <TouchableOpacity style={styles.btn} onPress={handleRegister}>
                    <Text style={{ color: colors.white }}>Đăng Ký</Text>
                </TouchableOpacity>

                <View style={styles.group3}>
                    <Text style={{ color: colors.text }}>Bạn đã có tài khoản ? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login', { data: 'default' })}>
                        <Text style={{ color: colors.red }}>Đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View>
                <Image resizeMode="stretch" style={styles.img} source={require('../../../src/assets/images/images.png')} />
            </View>
        </SafeAreaView>
    );
};

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
    img: {
        height: '46%',
        width: '100%', 
        justifyContent: 'center', 
        alignItems: 'center', 
    },
    container: {
        flex: 1,
        paddingTop: 30,
    },
    logo: {
        marginTop: 60,
        width: '100%',
        height: 200,
    },
    title: {
        marginTop: -50,
        alignItems: 'center'
    },
    form: {
        marginTop: 10,
        paddingHorizontal: 30,
    },
    group: {
        marginTop: 15
    },
    input: {
        borderBottomWidth: 1,
        borderColor: 'gray',
        paddingLeft: 35
    },
    icon: {
        fontSize: 25,
        position: 'absolute',
        top: 10,
        zIndex: 100
    },
    btn: {
        marginTop: 30,
        backgroundColor: colors.red,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20
    },
    group3: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'center'
    }
});

export default Register;
