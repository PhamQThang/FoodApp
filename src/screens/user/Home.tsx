import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, Image, Dimensions, FlatList, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ScrollView } from 'react-native-virtualized-view'

import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Fontisto';
import { RootStackParamList } from '../../../App';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../constaints/colors';
import firestore, {doc} from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Footer from '../../components/Footer';
type ScreenANavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
type Props = {
    navigation: ScreenANavigationProp;
    route : any
  };
  type FlashSaleItem = {
    id: any;
    name: any;
    price: any;
    image: any;
    discount: any,
    sellDay: any,
    evaluate:any;
    sellNumber: any;
  };
  type FoodItems = {
    sellNumber: any;
    id: any;
    name: any;
    price: any;
    image: any;
    discount: any,
    sellDay: any,
    evaluate:any;
    title: any
  };
  const Home: React.FC<Props> = ({ navigation, route }) => {
    const [userName, setUserName] = useState('');
    const { data } = route.params || { data: 'Default Value' };
    const [flashSaleItems, setFlashSaleItems] = useState<FlashSaleItem[]>([]);
    const [foodItems, setFoodItems] = useState<FoodItems[]>([]);
    const [colorNew, setColorNew] = useState('red');
    const [colorSell, setColorSell] = useState('black');
    const [colorEvaluate, setColorEvaluate] = useState('black');

    useEffect(() => {
        loadFlashSale();
        handleNew();
        console.log('==============HOME=================');
        console.log(data);
        console.log('====================================');
    }, [data]);

    const parseDate = (dateString: any) => {
        const [day, month, year] = dateString.split('/').map(Number);
        return new Date(year, month - 1, day);
    };

    const formatDate = (dateString: any) => {
        const [day, month, year] = dateString.split('/');
        return `${day}/${month}/${year}`;
    };

    const fetchProducts = async () => {
        try {
            const snapshot = await firestore().collection('products').get();
            let newData: FoodItems[] = [];

            for (const doc of snapshot.docs) {
                const discount = doc.data().discount;
                const productID = doc.data().productID;
                const productName = doc.data().productName;
                const price = doc.data().price;
                const priceDiscount = (parseInt(price) - parseInt(discount)) + '';
                const evaluate = doc.data().evaluate;
                const sellDay = doc.data().sellDay;
                const title = doc.data().title;
                const sellNumber = doc.data().sellNumber;
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
                        title: title,
                        sellNumber: sellNumber,
                    });
                } catch (error) {
                    console.error('Error push data:', error);
                    throw new Error('Failed to push data');
                }
            }

            return newData;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw new Error('Failed to fetch products');
        }
    };

    const loadFlashSale = async () => {
        setColorNew('red');
        setColorSell('black');
        setColorEvaluate('black');

        try {
            const newData = await fetchProducts();
            setFlashSaleItems(newData.sort((a, b) => b.discount - a.discount));
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch products');
        }
    };

    const handleNew = async () => {
        setColorNew('red');
        setColorSell('black');
        setColorEvaluate('black');

        try {
            const newData = await fetchProducts();
            setFoodItems(newData.sort((a, b) => parseDate(b.sellDay).getTime() - parseDate(a.sellDay).getTime()));
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch products');
        }
    };

    const handleSell = async () => {
        setColorNew('black');
        setColorSell('red');
        setColorEvaluate('black');

        try {
            const newData = await fetchProducts();
            setFoodItems(newData.sort((a, b) => b.sellNumber - a.sellNumber));
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch products');
        }
    };

    const handleEvaluate = async () => {
        setColorNew('black');
        setColorSell('black');
        setColorEvaluate('red');

        try {
            const newData = await fetchProducts();
            setFoodItems(newData.sort((a, b) => b.evaluate - a.evaluate));
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch products');
        }
    };

    const goToCart = async () => {
        try {
            let cartID;
            const userCartSnapshot = await firestore().collection('carts').where('userID', '==', data.userID).limit(1).get();
            if (userCartSnapshot.empty) {
                Alert.alert('Lỗi', 'Không thể vào giỏ hàng');
            } else {
                cartID = userCartSnapshot.docs[0].data().cartID;
                navigation.navigate('Cart', { data: cartID });
            }
        } catch (error) {
            console.error('Error navigating to cart: ', error);
            Alert.alert('Lỗi', 'Không thể vào giỏ hàng');
        }
    };

    function handleItem(item: any) {
        navigation.navigate('ProductDetail', { data: item, userID: data.userID });
    }

    const renderFlashSaleItem = ({ item }: { item: FlashSaleItem }) => (
        <TouchableOpacity onPress={() => handleItem(item)}>
            <View key={item.id} style={styles.saleItem}>
                <Image source={{ uri: item.image }} style={styles.saleImage} />
                <View style={styles.saleContent}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={styles.foodPrice}>{item.price}</Text>
                    <Text style={styles.foodPriceDiscount}>{item.price - item.discount}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderFoodItem = ({ item }: { item: FoodItems }) => (
      <TouchableOpacity onPress={() => handleItem(item)}>
        <View key={item.id} style={styles.foodItem}>
          <Image source={{ uri: item.image }} style={styles.foodImage} />
          <View style={styles.foodContent}>
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodDay}>{formatDate(item.sellDay)}</Text>
              <Text style={styles.foodSellNumber}>{item.sellNumber} đã bán</Text>
              <Text style={styles.foodEvaluate}>{item.evaluate} sao</Text>
            </View>
            <View style={styles.foodPriceContainer}>
              <Text style={styles.foodPrice}>{item.price}</Text>
              <Text style={styles.foodPriceDiscount}>{item.price - item.discount}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
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
            <Image source={require('../../../src/assets/images/footer.png')} style={styles.image}/>
              {/* flashSale */}
              <View style={styles.saleContainer}>
                <View style={styles.saleHeader}>
                  <Text style={styles.saleTitle}>Flash Sale</Text>
                  {/* <TouchableOpacity style={styles.saleButton}>
                    <Text style={styles.saleButtonText}>Xem Thêm</Text>
                  </TouchableOpacity> */}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    paddingBottom: 60,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 10,
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 5,
  },
  iconSearch: {
    padding: 10,
    fontSize: 20,
    color: "#000",
  },
  iconCart: {
    paddingLeft: 10,
    paddingRight: 5,
    fontSize: 25,
    color: "#000",
  },
  image: {
    width: windowWidth,
    height: 150,
    backgroundColor: '#FFFF66',
  },
  saleContainer: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    marginVertical: 10,
    borderRadius: 10,
  },
  saleContent:{
    marginTop: 4,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  saleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'red'
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
    padding: 10,
    backgroundColor: '#FFDEAD', // New background color for flash sale items
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  saleImage: {
    width: 100,
    height: 80,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  foodImage: {
    width: 120,
    height: 100,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  foodContent: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  foodInfo: {
    marginBottom: 5,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  foodDay: {
    fontSize: 12,
    color: '#A9A9A9',
  },
  foodSellNumber: {
    fontSize: 12,
    color: '#A9A9A9',
  },
  foodEvaluate: {
    fontSize: 12,
    color: '#FFD700',
  },
  foodPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodPrice: {
    fontSize: 12,
    color: '#686868',
    textDecorationLine: 'line-through',
  },
  foodPriceDiscount: {
    fontSize: 20,
    color: '#FF6347',
    fontWeight: '800',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    marginVertical: 10,
    borderRadius: 10,
  },
  filterText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  filterItem: {
    width: '33.333%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  separator: {
    width: 1,
    height: '100%',
    backgroundColor: '#ccc',
  },
});

