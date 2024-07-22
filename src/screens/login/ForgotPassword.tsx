import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, StatusBar } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../../constaints/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
type ForgotPasswordNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;
type Props = {
  navigation: ForgotPasswordNavigationProp;
};

const ForgotPassword: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleForgotPassword = async () => {
    try {
      const userSnapshot = await firestore().collection('users').where('email', '==', email).get();
      
      if (userSnapshot.empty) {
        Alert.alert('Lỗi', 'Email không tồn tại');
      } else {
        //Phải thêm tài khoản vào authentication trên Firebase thì mới gửi request về gmail được
        await auth().sendPasswordResetEmail(email);
        Alert.alert('Thành công', 'Đã gửi email reset mật khẩu');
        navigation.navigate('Login', { data: 'default' }); // Điều hướng về màn hình đăng nhập
      }
    } catch (error) {
      console.error('Lỗi reset mật khẩu:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi reset mật khẩu');
    }
  };

  return (
  <SafeAreaView style={styles.container}>
    <StatusBar backgroundColor={colors.bgColor} barStyle={'dark-content'} />
    <Image source={require('../../../src/assets/images/footer.png')} style={styles.logo} />

    <View style={styles.title}>
      <Text style={{ fontWeight: 'bold', fontSize: 30, color: 'black' }}>Quên mật khẩu</Text>
    </View>

    <View style={styles.form}>
      <View style={styles.group}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Nhập Email"
          style={styles.input}
          keyboardType="email-address"
        />
      </View>
      <TouchableOpacity onPress={handleForgotPassword} style={styles.btn}>
        <Text style={{ color: colors.white }}>Gửi email reset mật khẩu</Text>
      </TouchableOpacity>
    </View>

    <Image resizeMode="stretch" style={styles.img} source={require('../../../src/assets/images/images.png')} />
  </SafeAreaView>
);

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 100,
      },
      logo: {
        marginTop: 60,
        width: '100%',
        height: 200,
      },
      title: {
        marginTop: -10,
        alignItems: 'center',
      },
      form: {
        marginTop: 10,
        paddingHorizontal: 30,
      },
      group: {
        marginTop: 15,
      },
      input: {
        borderBottomWidth: 1,
        borderColor: 'gray',
        paddingLeft: 35,
      },
      btn: {
        marginTop: 30,
        backgroundColor: colors.red,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
      },
      img: {
        marginTop: 20,
        height: 230,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      },

});

export default ForgotPassword;
