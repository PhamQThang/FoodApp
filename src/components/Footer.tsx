// Footer.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Fontisto';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../constaints/colors';

const Footer = ({ navigation, data }: { navigation: any; data: string }) => {
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
      navigation.navigate(page, { data: data });
    };

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.itemBottom}
        onPress={() => handleNavigation('Home')}
      >
        <Icon name="home" size={30} color={activePage === 'Home' ? '#FF0000' : '#000'} style={styles.iconBottom} />
        <Text style={[styles.textBottom, activePage === 'Home' && styles.activeText]}>Trang Chủ</Text>
      </TouchableOpacity>
      <View style={styles.separator} />
      <TouchableOpacity
        style={styles.itemBottom}
        onPress={() => handleNavigation('Invoice')}
      >
        <FontAwesome6Icon name="receipt" size={30} color={activePage === 'Invoice' ? '#FF0000' : '#000'} style={styles.iconBottom} />
        <Text style={[styles.textBottom, activePage === 'Invoice' && styles.activeText]}>Hóa Đơn</Text>
      </TouchableOpacity>
      <View style={styles.separator} />
      <TouchableOpacity
        style={styles.itemBottom}
        onPress={() => handleNavigation('Information')}
      >
        <FontAwesomeIcon name="user-circle" size={30} color={activePage === 'Information' ? '#FF0000' : '#000'} style={styles.iconBottom} />
        <Text style={[styles.textBottom, activePage === 'Information' && styles.activeText]}>Thông Tin</Text>
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
  

export default Footer;
