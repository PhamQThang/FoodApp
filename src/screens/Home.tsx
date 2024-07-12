import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, Image, Dimensions, FlatList, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ScrollView } from 'react-native-virtualized-view'

import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Fontisto';
import { RootStackParamList } from '../../App';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../constaints/colors';
import firestore, {doc} from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Footer from '../components/Footer';
type ScreenANavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
type Props = {
    navigation: ScreenANavigationProp;
    route : any
  };
  type FlashSaleItem = {
    id: string;
    name: string;
    price: string;
    image: any;
    discount: string,
    sellDay: string,
    evaluate:string;
  };
  type FoodItems = {
    id: string;
    name: string;
    price: string;
    image: any;
    discount: string,
    sellDay: string,
    evaluate:string;
  };

const Home: React.FC<Props> = ({ navigation, route }) => {
  const [userName, setUserName] = useState('')
  const {data} = route.params || { data: 'Default Value' };
  const [flashSaleItems, setFlashSaleItems] = useState<{ id: any; name: any; price: string; image: string; discount: any; evaluate: any; sellDay: any; }[]>([]);
  const [foodItems,setFoodItems]= useState<{ id: any; name: any; price: string; image: string; discount: any; evaluate: any; sellDay: any; }[]>([]);

  const [colorNew, setColorNew] = useState('red')
  const [colorSell, setColorSell] = useState('black')
  const [colorEvaluate, setColorEvaluate] = useState('black')
  

  useEffect(()=> {
    //loadUserName()
    loadFlashSale()
    handleNew()
    console.log('==============LOGIN -> HOME=================');
    console.log(data);
    console.log('====================================');
  }, [data])

  const sortByKey = (data: any[], key: string) => {
    return data.sort((a, b) => {
      if (a[key] > b[key]) {
        return 1;
      }
      if (a[key] < b[key]) {
        return -1;
      }
      return 0;
    });
  };
  //load userName
  // const loadUserName = async () => {
  //   const snapshot = await firestore().collection('users').get()
  //   for(const doc of snapshot.docs){
  //     const emailFB = doc.data().email
  //     if(email===emailFB){
  //       setUserName(doc.data().userName)
  //       break
  //     }
  //   }
  // }

  // fetchProduct
  const fetchProducts = async (sortBy: 'discount' | 'sellDay' | 'evaluate') => {
    try {
      const snapshot = await firestore().collection('products').get();
      let newData = [];
  
      for (const doc of snapshot.docs) {
          const discount = doc.data().discount;
          const productID = doc.data().productID;
          const productName = doc.data().productName;
          const price = doc.data().price;
          const priceDiscount = (parseInt(price) - parseInt(discount)) + '';
          const evaluate = doc.data().evaluate;
          const sellDay = doc.data().sellDay;
          const title = doc.data().title
          const imageURL = doc.data().image;
          const imageRef = storage().ref().child("productFile").child(imageURL);
          try {
            const url = await imageRef.getDownloadURL();
            newData.push({
              id: productID,
              name: productName,
              price: priceDiscount,
              image: url,
              discount: discount,
              evaluate: evaluate,
              sellDay: sellDay,
              title: title
            });
          } catch (error) {
            newData.push({
              id: productID,
              name: productName,
              price: priceDiscount,
              discount: discount,
              image: 'imgURL error',
              evaluate: evaluate,
              sellDay: sellDay,
              title: title
            });
          }
      }
  
      // Sắp xếp dữ liệu theo sortBy
      newData = sortByKey(newData, sortBy);
  
      // Trả về newData để sử dụng trong các hàm gọi fetchProducts
      return newData;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

//load flashSale
  const loadFlashSale = async () => {
    setColorNew('red');
    setColorSell('black');
    setColorEvaluate('black');

    try {
      const newData = await fetchProducts('discount');
      setFlashSaleItems(newData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch products');
    }
  }
  //click Mới Nhất
  const handleNew = async ()=> {
    setColorNew('red')
    setColorSell('black')
    setColorEvaluate('black')

    try {
      const newData = await fetchProducts('sellDay');
      setFoodItems(newData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch products');
    }
  }

  // click bán chạy
  const handleSell = async ()=> {
    setColorNew('black')
    setColorSell('red')
    setColorEvaluate('black')

    try {
      const newData = await fetchProducts('evaluate');
      setFoodItems(newData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch products');
    }
  }

    // click đánh giá
    const handleEvaluate = async ()=> {
      setColorNew('black')
      setColorSell('black')
      setColorEvaluate('red')
  
      try {
        const newData = await fetchProducts('evaluate');
        setFoodItems(newData);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch products');
      }
    }

    const goToCart = async () => {
      try {
        const cartsSnapshot = await firestore().collection('carts').get();
        let cartID;

        // Tìm cartID lớn nhất hiện có và tăng giá trị đó lên 1
        let maxCartID = 0;
        cartsSnapshot.forEach(doc => {
            const currentCartID = parseInt(doc.data().cartID);
            if (currentCartID > maxCartID) {
                maxCartID = currentCartID;
            }
        });
        const newCartID = (maxCartID + 1).toString();

        const userCartSnapshot = await firestore().collection('carts').where('userID', '==', data.userID).limit(1).get();
        if (userCartSnapshot.empty) {
          // Nếu người dùng chưa có giỏ hàng, tạo giỏ hàng mới
          await firestore().collection('carts').doc(newCartID).set({
              cartID: newCartID, // Sử dụng ID tự tạo
              userID: data.userID,
              date: new Date().toISOString()
          });
          cartID = newCartID;
          console.log('====================================');
          console.log('HOME chua co gio hang : ' + cartID);
          console.log('====================================');
          //CHUYỂN SANG TRANG CART
          navigation.navigate('Cart', { data : cartID });

      } else {
          // Nếu người dùng đã có giỏ hàng, lấy cartID hiện có
          cartID = userCartSnapshot.docs[0].data().cartID;
          console.log('====================================');
          console.log('HOME da co gio hang : ' + cartID);
          console.log('====================================');
          navigation.navigate('Cart', { data : cartID });

      }

      } catch (error) {
        console.error('Error navigating to cart: ', error);
        Alert.alert('Lỗi', 'Không thể vào giỏ hàng');
      }
    }

  //click vao cac item
  function handleItem(item:any) {
    navigation.navigate('ProductDetail' ,{data:item, userID: data.userID})
  }
  const renderFlashSaleItem = ({ item }: { item: FlashSaleItem }) => (
    <TouchableOpacity onPress={() => handleItem(item)}>
      <View key={item.id} style={styles.saleItem}>
        <Image source={{uri: item.image}} style={styles.foodImage} />
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  )
  const renderFoodItem =({ item }: { item: FoodItems })=> {
      return (
          <View key={item.id} style={styles.foodItem}>
              <Image source={{uri: item.image}} style={styles.foodImage} />
              <View>
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodPrice}>{item.price}</Text>
              </View>
          </View>
      );
  };
  return (
    <SafeAreaView style={styles.safeArea}>
        {/* header */}
        <View style={styles.headerContainer}>
          <View style={styles.searchContainer}>
            <TextInput placeholder='Tìm kiếm sản phẩm' style={styles.searchInput}/>
  
            <TouchableOpacity><Icon name="search" style={styles.iconSearch}/></TouchableOpacity>
          </View>
  
          <TouchableOpacity onPress={goToCart}>
            <Icon name="shopping-basket"  style={styles.iconCart}/>
          </TouchableOpacity>
        </View>
  
          <ScrollView >
            <Image source={require('../assets/images/footer.png')} style={styles.image}/>
              {/* flashSale */}
              <View style={styles.saleContainer}>
                <View style={styles.saleHeader}>
                  <Text style={styles.saleTitle}>Flash Sale</Text>
                  <TouchableOpacity style={styles.saleButton}>
                    <Text style={styles.saleButtonText}>Xem Thêm</Text>
                  </TouchableOpacity>
                </View>
                  <FlatList
                    data={flashSaleItems}
                    renderItem={renderFlashSaleItem}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  />
              </View>
              <View style={styles.filterContainer}>
                <TouchableOpacity style={styles.filterItem} onPress={handleNew}>
                  <Text style={[styles.filterText, {color:colorNew}]}>Mới Nhất</Text>
                </TouchableOpacity>
                  <View style={styles.separator} />
                <TouchableOpacity style={styles.filterItem} onPress={handleSell}>
                  <Text style={[styles.filterText, {color:colorSell}]}>Bán Chạy</Text>
                </TouchableOpacity>
                <View style={styles.separator} />
                <TouchableOpacity style={styles.filterItem} onPress={handleEvaluate}>
                  <Text style={[styles.filterText, {color:colorEvaluate}]}>Đánh Giá</Text>
                </TouchableOpacity>
              </View>
                <FlatList
                  data={foodItems}
                  renderItem={renderFoodItem}
                  keyExtractor={item => item.id}
                  horizontal={false}
                  showsVerticalScrollIndicator
                  style={styles.scrollView}
                />
          </ScrollView>
    {/* footer */}
      <Footer navigation={navigation} data={data}/>
    </SafeAreaView>
  )
}

export default Home
const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  safeArea:{
    flex:1,
  },
  scrollView:{
    paddingBottom: 100
  },
  headerContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  searchContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 10,
    flex: 1,

  },
  searchInput:{
    flex: 1,
  },
  iconSearch:{
    padding: 10,
     fontSize: 20,
     color: "#000"
  },
  iconCart:{
    paddingLeft: 10,
    paddingRight: 5,
    fontSize: 25,
     color: "#000"
  },
  image: {
    width: windowWidth,
    height: 150,
    backgroundColor: '#FFFF66',  
  },
  // Sale
  saleContainer: {
    padding: 4,
    backgroundColor: '#fff',
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 4,

  },
  saleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  saleButton: {
    padding: 4,
  },
  saleButtonText: {
    fontSize: 16,
    color: '#007BFF',
  },
  
  saleItem: {
    marginRight: 10,
    padding: 16,
    backgroundColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
    //foodItem
    foodItem:{
      paddingTop:10,
      flexDirection: 'row',
      backgroundColor: colors.white,
      width:'100%',
    },
  foodImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  foodName: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodPrice: {
    marginTop: 4,
    fontSize: 14,
    color: 'red',
  },
  // Filter
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center'
  },
  filterItem:{
    width: '33.333%'
  },
  separator: {
    width: 1,
    height: '100%',
    backgroundColor: '#ccc',
  },


})