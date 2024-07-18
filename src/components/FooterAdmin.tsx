// Footer.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Fontisto';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../constaints/colors';

const FooterAdmin = ({ navigation, data }: { navigation: any; data: string }) => {
    const [activePage, setActivePage] = useState('Home');
    useEffect(() => {
        const unsubscribe = navigation.addListener('state', (e: any) => {
          const routeName = e.data.state.routes[e.data.state.index].name;
          setActivePage(routeName);
        });
    
        return unsubscribe;
      }, [navigation]);
    const handleNavigation = (page: string) => {
      setActivePage(page);
      navigation.navigate(page, { data: 'default' });
    };

  return (
    <View style={styles.footer}>
      <View style={styles.separator} />
      <TouchableOpacity
        style={styles.itemBottom}
        onPress={() => handleNavigation('ManageProduct')}
      >
        <FontAwesome6Icon name="receipt" size={30} color={activePage === 'ManageProduct' ? '#FF0000' : '#000'} style={styles.iconBottom} />
        <Text style={[styles.textBottom, activePage === 'ManageProduct' && styles.activeText]}>Sản Phẩm</Text>
      </TouchableOpacity>
      <View style={styles.separator} />
      <TouchableOpacity
        style={styles.itemBottom}
        onPress={() => handleNavigation('ChangeInvoice')}
      >
        <FontAwesomeIcon name="user-circle" size={30} color={activePage === 'ChangeInvoice' ? '#FF0000' : '#000'} style={styles.iconBottom} />
        <Text style={[styles.textBottom, activePage === 'ChangeInvoice' && styles.activeText]}>Hóa Đơn</Text>
      </TouchableOpacity>
      <View style={styles.separator} />
      <TouchableOpacity         
      style={styles.itemBottom}
      onPress={()=>{navigation.navigate("Login",{data:'default'})}}>
        <FontAwesomeIcon name="sign-out" size={30} color={activePage === 'Login' ? '#FF0000' : '#000'} style={styles.iconBottom} />
      <Text style={[styles.textBottom, activePage === 'Login' && styles.activeText]}>Đăng Xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    footer: {
      position: 'absolute',
      bottom: 0,
      flexDirection: 'row',
      width: '100%',
      backgroundColor: '#fff',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 10,
    },
    itemBottom: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
    },
    activeText: {
        color: '#FF0000',
      },
    iconBottom: {
      fontSize: 20,
    },
    textBottom: {
        marginTop: 2,
      fontSize: 12,
      color: '#000',
    },
    separator: {
      width: 1,
      height: '100%',
      backgroundColor: '#ccc',
    },
  });
  

export default FooterAdmin;
