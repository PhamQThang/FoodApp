import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, StatusBar, TextInput, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Fontisto';
import CheckBox from '@react-native-community/checkbox';
import { colors } from '../constaints/colors';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import firestore from '@react-native-firebase/firestore';

type ScreenANavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
type Props = {
  navigation: ScreenANavigationProp;
};

const Login: React.FC<Props> = ({ navigation }) => {
  const [toggleCheckBox, setToggleCheckBox] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmail = (newText: string) => {
    setEmail(newText);
  };

  const handlePassword = (newText: string) => {
    setPassword(newText);
  };

  const handleLogin = async () => {
    try {
      const snapshot = await firestore().collection('users').get();
      let loggedInUser = null;

      for (const doc of snapshot.docs) {
        const emailFB = doc.data().email;
        const passFB = doc.data().password;
        if (emailFB.trim() === email.trim() && passFB.trim() === password.trim()) {
          loggedInUser = doc.data();
          break;
        }
      }

      if (loggedInUser) {
        navigation.navigate('Home', { data: loggedInUser });
      } else {
        Alert.alert('Đăng nhập thất bại', 'Email hoặc mật khẩu không đúng');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      Alert.alert('Đăng nhập thất bại', 'Đã xảy ra lỗi khi đăng nhập');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.bgColor} barStyle={'dark-content'} />
      <Image source={require('../assets/images/footer.png')} style={styles.logo} />

      <View style={styles.title}>
        <Text style={{ fontWeight: 'bold', fontSize: 30, color: 'black' }}>Đăng Nhập</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.group}>
          <Icon name="email" style={styles.icon} />
          <TextInput value={email} onChangeText={handleEmail} placeholder="Nhập Email" style={styles.input} />
        </View>

        <View style={styles.group}>
          <Icon name="locked" style={styles.icon} />
          <TextInput
            value={password}
            onChangeText={handlePassword}
            secureTextEntry={true}
            placeholder="Nhập Mật Khẩu"
            style={styles.input}
          />
          <Icon name="eye" style={styles.iconEye} />
        </View>

        <View style={styles.group1}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CheckBox
              disabled={false}
              value={toggleCheckBox}
              onValueChange={(newValue) => setToggleCheckBox(newValue)}
              tintColors={{ true: colors.red }}
            />
            <Text style={{ color: colors.text }}>Nhớ Mật Khẩu</Text>
          </View>
          <TouchableOpacity>
            <Text style={{ color: colors.red }}>Quên Mật Khẩu</Text>
          </TouchableOpacity>
        </View>

        <View>
          <TouchableOpacity onPress={handleLogin} style={styles.btn}>
            <Text style={{ color: colors.white }}>Đăng Nhập</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.group3}>
          <Text style={{ color: colors.text }}>Bạn chưa có tài khoản ? </Text>
          <View>
            <TouchableOpacity onPress={() => navigation.navigate('Register', { data: 'default' })}>
              <Text style={{ color: colors.red }}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Image resizeMode="stretch" style={styles.img} source={require('../assets/images/images.png')} />
    </SafeAreaView>
  );
};

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
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
  icon: {
    fontSize: 25,
    position: 'absolute',
    top: 10,
    zIndex: 100,
  },
  iconEye: {
    fontSize: 25,
    position: 'absolute',
    top: 10,
    right: 0,
    zIndex: 100,
  },
  group1: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btn: {
    marginTop: 30,
    backgroundColor: colors.red,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  group3: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  img: {
    marginTop: 20,
    height: 230,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Login;
