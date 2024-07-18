import { NavigationProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import FooterAdmin from "../../components/FooterAdmin";

type ScreenANavigationProp = StackNavigationProp<RootStackParamList, 'ManageProduct'>;
type Props = {
  navigation: ScreenANavigationProp;
  route: any
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
const ChangeInvoice: React.FC<Props> = ({ route, navigation }) => {
  const [invoice, setInvoice] = useState<
    { orderdate: string;orderid: string; status: string; totalamount: string; userid: string}[]
  >([]);
  const { data } = route.params;
  const [status, setStatus] = useState('ChangeInvoice');
  const [load,setLoad] = useState('');
  const fetchOrders = async () => {
    try {
      const snapshot = await firestore().collection('orders').get();
      const newdata: { orderdate: string;orderid: string; status: string; totalamount: string; userid: string}[] = [];
      for (const doc of snapshot.docs) {
        const OrderData = doc.data();
        const OrderDate = OrderData.orderDate;
        const OrderID = OrderData.orderID;
        const Status = OrderData.status;
        const TotalAmount = OrderData.totalAmount;
        const UserID = OrderData.userID;
        
        try {
          newdata.push({
            orderid: OrderID,
            orderdate: OrderDate,
            status: Status,
            totalamount: TotalAmount,
            userid: UserID,
            
          });
          
        } catch (error) {
          console.error('Error fetching image URL:', error);
          Alert.alert('Error', 'Failed to fetch product images');
        }
      }

      setInvoice(newdata);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products');
    }
  };

  async function changeStatus(item:any) {
    try {
        await firestore()
          .collection('orders')
          .doc(item.orderid)
          .update({ status: 'Đã Giao' });
        setLoad('1'); // Trích xuất và hiển thị lại danh sách sản phẩm
      } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        // Xử lý lỗi tại đây, ví dụ hiển thị thông báo lỗi cho người dùng
      }
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
  const renderOrderItem = ({ item }: { item: { orderdate: string;orderid: string; status: string; totalamount: string; userid: string} }) => (
    <TouchableOpacity onLongPress={()=>deleteItem(item)} style={styles.item}> 
          <View>
          <Text style={styles.foodName}>Status:{item.status}</Text>
          <Text style={styles.foodName}>User ID:{item.userid}</Text>
        <Text style={styles.foodName}>Order ID:{item.orderid}</Text>
        <View style={styles.ordercontainer}>
            <View>
                <Text style={styles.foodPrice}>Date:{item.orderdate}</Text>
                <Text style={styles.foodPrice}>Total:{item.totalamount}</Text>
            </View>
            <TouchableOpacity style={styles.giaobutton} onPress={()=>changeStatus(item)}>
            <Text style={styles.giaotext}>Đã Giao</Text>
            </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
    
  );

  useEffect(() => {
    setLoad('0')
    fetchOrders();
    console.log('====================================');
    console.log(data);
    console.log('====================================');
  }, [data,load]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity style={styles.background1}>
        <Text style={styles.text}>Danh Sách Hoá Đơn</Text>
      </TouchableOpacity>
      <View style={{display:'flex', margin:10}}>
        <FlatList
          data={invoice}
          renderItem={renderOrderItem}
          keyExtractor={item => item.orderid}
          horizontal={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <FooterAdmin navigation={navigation} data={data} />
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    item:{
        padding:10,
        borderColor:'grey',
        borderWidth: 1, // Thêm thuộc tính này để hiện border
        borderStyle: 'solid',
        borderRadius: 17.5,
        backgroundColor:'#ACBDC3',
    },
    giaotext:{
        alignItems:'center',
        paddingTop:5,
        paddingLeft:5,
        color:'white',
    },
    giaobutton:{
        backgroundColor:'red',
        marginLeft:75,
        height:30,
        width:60,
        borderRadius: 17.5,
    },
    ordercontainer:{
        flexDirection:'row'
    },
  listButton: {
    
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'space-evenly',
    
  },
  text:{
    fontSize: 20,
    fontWeight: '600'
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
    paddingTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {

    backgroundColor: 'grey',
    height: 30,
    alignContent:'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: 150,
    
  },
  foodItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
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

export default ChangeInvoice;


