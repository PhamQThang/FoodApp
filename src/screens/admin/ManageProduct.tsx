import { NavigationProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import FooterAdmin from '../../components/FooterAdmin';
import HomeAdmin from "../admin/HomeAdmin";

type ScreenANavigationProp = StackNavigationProp<RootStackParamList, 'ManageProduct'>;
type Props = {
  navigation: ScreenANavigationProp;
};
type FlashSaleItem = {
  id: any;
  name: any;
  price: string;
  image: any;
  discount: any,
  sellDay: any,
  evaluate:any;
};
const ManageProduct: React.FC<Props> = ({ route, navigation }) => {
  const [flashSaleItems, setFlashSaleItems] = useState<
    { id: string; name: string; price: string; image: string; discount: string; evaluate: number; sellDay: string; title: string }[]
  >([]);
  const { data } = route.params;
  const [status, setStatus] = useState('ManageProduct');
  const [load,setLoad] = useState('');
  const [HomeAdmin,setHomeAdmin]= useState('<Home');
  const fetchFlashSaleItems = async () => {
    try {
      const snapshot = await firestore().collection('products').get();
      const newdata: { id: string; name: string; price: string; image: string; discount: string; evaluate: number; sellDay: string; title: string }[] = [];
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
  function handleItem(item:any) {
    navigation.navigate('AddProduct',{data:item})
  }
  function deleteItem(item:any){
    Alert.alert('Bạn muốn xoá ko', '', [
      {
        text: 'Không',
        style: 'cancel',
      },
      {text: 'Có', onPress: async () => {
        
        await firestore().collection('products').doc(item.id).delete();
        setLoad('1');
      }},
    ])
  }
  const renderFoodItem = ({ item }: { item: { id: string; name: string; price: string; image: string; discount: string; evaluate: number; sellDay: string; title: string } }) => (
    <TouchableOpacity onPress={() => handleItem(item)} onLongPress={()=>deleteItem(item)}>
        <View key={item.id} style={styles.foodItem}>
      <Image source={{ uri: item.image }} style={styles.foodImage} />
          <View>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodPrice}>{item.price}</Text>
      </View>
        </View>
    </TouchableOpacity>
    
  );
  useEffect(() => {
    setLoad('0')
    fetchFlashSaleItems();
  }, [data,load]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity onPress={()=>{navigation.navigate("HomeAdmin",{data:data})}}>
            <Text style={styles.saleTitle}>{HomeAdmin}</Text>
      </TouchableOpacity>
      <View style={styles.listButton}>
        <TouchableOpacity onPress={() => navigation.navigate('ManageProduct',{data:'default'})}>
          <Text style={[styles.itemButton,  styles.activeButton]}>Sản phẩm</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ChangeInvoice',{data:'default'})}>
          <Text style={[styles.itemButton]}>Hoá đơn</Text>
        </TouchableOpacity>
      </View>
      <View style={{display:'flex'}}>
        <TouchableOpacity style={styles.background} onPress={() => navigation.navigate('AddProduct', { data: 'default' })}>
          <Text style={[styles.itemThem]}>Thêm Sản Phẩm</Text>
        </TouchableOpacity>
        
        <FlatList
          data={flashSaleItems}
          renderItem={renderFoodItem}
          keyExtractor={item => item.id}
          horizontal={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      
      <FooterAdmin navigation={navigation} data={data} />
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  saleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  listButton: {
    marginTop: 10,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'space-evenly',
    paddingBottom:10,
  },
  itemButton: {
    fontSize: 16,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  activeButton: {
    color: 'red',
    borderBottomColor: 'red',
  },
  background1: {
    backgroundColor: '#fff',
    paddingTop: 10,
    
  },
  background: {
    backgroundColor: 'red',
    height: 35,
    alignItems: 'center',
    alignSelf: 'center',
    width: 150,
    borderCurve:'circular',
    borderRadius: 17.5,
  },
  itemThem:{
    fontSize:18,
    color: 'white',
    paddingTop:5,
  },
  foodItem: {
    
    backgroundColor: '#ACBDC3',
    borderRadius: 10,
    margin:10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1, 
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  foodName: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodPrice: {
    marginLeft: 10,
    fontSize: 14,
    color: 'red',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default ManageProduct;


