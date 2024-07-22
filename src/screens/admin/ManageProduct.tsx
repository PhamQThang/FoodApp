import { NavigationProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import FooterAdmin from '../../components/FooterAdmin';

type ScreenANavigationProp = StackNavigationProp<RootStackParamList, 'ManageProduct'>;
type Props = {
  navigation: ScreenANavigationProp;
  route: any;
};
type FlashSaleItem = {
  id: any;
  name: any;
  price: string;
  image: any;
  discount: any;
  sellDay: any;
  evaluate: any;
  title: any
};

const ManageProduct: React.FC<Props> = ({ route, navigation }) => {
  const [flashSaleItems, setFlashSaleItems] = useState<FlashSaleItem[]>([]);
  const { data } = route.params;
  const [status, setStatus] = useState('ManageProduct');
  const [load, setLoad] = useState('');

  const fetchFlashSaleItems = async () => {
    try {
      const snapshot = await firestore().collection('products').get();
      const newdata: FlashSaleItem[] = [];
      for (const doc of snapshot.docs) {
        const productData = doc.data();
        const discount = productData.discount;
        const productID = doc.id;
        const productName = productData.productName;
        const price = productData.price;
        const priceDiscount = (parseInt(price) - parseInt(discount)).toString();
        const imageURL = productData.image;
        const evaluate = productData.evaluate;
        const sellDay = productData.sellDay;
        const title = productData.title;
        try {
          const url = await storage().ref().child("productFile").child(imageURL).getDownloadURL();
          newdata.push({
            id: productID,
            name: productName,
            price: priceDiscount,
            image: url,
            discount: discount,
            evaluate: evaluate,
            sellDay: sellDay,
            title: title,
          });
        } catch (error) {
          console.error('Error fetching image URL:', error);
          Alert.alert('Error', 'Failed to fetch product images');
        }
      }
      setFlashSaleItems(newdata);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products');
    }
  };

  function handleItem(item: FlashSaleItem) {
    navigation.navigate('AddProduct', { data: item });
  }

  function deleteItem(item: FlashSaleItem) {
    Alert.alert('Bạn muốn xoá không?', '', [
      {
        text: 'Không',
        style: 'cancel',
      },
      {
        text: 'Có', onPress: async () => {
          await firestore().collection('products').doc(item.id).delete();
          setLoad('1');
        }
      },
    ]);
  }

  const renderFoodItem = ({ item }: { item: FlashSaleItem }) => (
    <TouchableOpacity onPress={() => handleItem(item)} onLongPress={() => deleteItem(item)}>
      <View key={item.id} style={styles.foodItem}>
        <Image source={{ uri: item.image }} style={styles.foodImage} />
        <View style={styles.foodDetails}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodPrice}>{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    setLoad('0');
    fetchFlashSaleItems();
  }, [data, load]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddProduct', { data: 'default' })}>
          <Text style={styles.addButtonText}>Thêm Sản Phẩm</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={flashSaleItems}
        renderItem={renderFoodItem}
        keyExtractor={item => item.id}
        horizontal={false}
        showsHorizontalScrollIndicator={false}
      />
      <FooterAdmin navigation={navigation} data={data} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: 60

  },
  addButtonContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  addButton: {
    backgroundColor: 'red',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 18,
    color: 'white',
  },
  foodItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    margin: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  foodImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  foodDetails: {
    marginLeft: 10,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodPrice: {
    fontSize: 14,
    color: 'red',
    marginTop: 5,
  },
});

export default ManageProduct;
