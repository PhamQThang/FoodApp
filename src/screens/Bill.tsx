import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
type ScreenANavigationProp = StackNavigationProp<RootStackParamList, 'Bill'>;
type Props = {
    navigation: ScreenANavigationProp;
    route: any;
};

interface Product {
    productName: string;
    price: number;
    discount: number;
    quantity: number;
    image: string;
}

const Bill: React.FC<Props> = ({ navigation, route }) => {
    const { data, selectedProducts, totalPrice } = route.params;

    const [shippingInfo, setShippingInfo] = useState({
        name: '',
        address: '',
        phone: '',
    });

    useEffect(() => {
        loadInforUser()
    
    }, []);
    const loadInforUser = async () => {
        // Lấy thông tin người dùng từ bảng users
        const userSnapshot = await firestore().collection('users').doc(data).get();
        if (!userSnapshot.exists) {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
            return;
        }
        const userInfo = userSnapshot.data();
        if (userInfo) {
            setShippingInfo({
                name: userInfo.name || '',
                address: userInfo.address || '',
                phone: userInfo.phone || ''
            });
        } else {
            Alert.alert('Lỗi', 'Thông tin người dùng bị thiếu');
        }
    }
    const handlePayment = async () => {
        // Validate shipping information
        if (!shippingInfo.name || !shippingInfo.address || !shippingInfo.phone) {
            Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin giao hàng');
            return;
        }
    
        try {
            // Tạo hóa đơn mới
            const snapshot = await firestore().collection('orders').orderBy('orderID', 'desc').limit(1).get();
            let newOrderID = 1;
    
            if (!snapshot.empty) {
                const lastOrder = snapshot.docs[0].data();
                newOrderID = parseInt(lastOrder.orderID) + 1;
            }
    
            const currentDate = new Date();
            const formattedDate = currentDate.toISOString();
    
            await firestore().collection('orders').doc(newOrderID.toString()).set({
                orderID: newOrderID.toString(),
                userID: data,
                orderDate: formattedDate,
                status: "Đã Đặt",
                totalAmount: totalPrice
            });
    
            selectedProducts.forEach(async (item: {cartItemID: any, productID: any; productName: any; price: any; discount: any; quantity: any; image: any; }) => {
                const orderDetailsSnapshot = await firestore().collection('orderDetails').orderBy('orderDetailID', 'desc').limit(1).get();
                let newOrderDetailID = 1;
    
                if (!orderDetailsSnapshot.empty) {
                    const lastOrderItem = orderDetailsSnapshot.docs[0].data();
                    newOrderDetailID = parseInt(lastOrderItem.orderDetailID) + 1;
                }
    
                await firestore().collection('orderDetails').doc(newOrderDetailID.toString()).set({
                    orderID: newOrderID.toString(),
                    orderDetailID: newOrderDetailID.toString(),
                    productID: item.productID,
                    name: shippingInfo.name,
                    phone : shippingInfo.phone,
                    address: shippingInfo.address,
                    quantity: item.quantity,
                    price: item.price - item.discount
                });
                
                //xoa danh sách sản phẩm được chọn trong giỏ hàng sau khi thanh toán
                await firestore().collection('cartItems').doc(item.cartItemID).delete();

                console.log('====================================');
                console.log('cartitemid dc chọn truyền sang :' + item.cartItemID);
                console.log('====================================');
                console.log('productID:', item.productID);
                console.log('ProductName:', item.productName);
                console.log('Price:', item.price);
                console.log('Discount:', item.discount);
                console.log('Quantity:', item.quantity);
                console.log('Image:', item.image);
            });
            
            const snapshotUser = await firestore().collection('users').get();
            let loggedInUser = null;
        
            for (const doc of snapshotUser.docs) {
                const userID_FB = doc.data().userID;
                if (userID_FB.trim() === data) {
                loggedInUser = doc.data();
                break;
                }
            }
            Alert.alert('Thanh toán thành công');
            // Điều hướng sang trang Home và truyền dữ liệu
            navigation.navigate('Home', { data: loggedInUser });

        } catch (error) {
            console.error('Error handling payment:', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại sau.');
        }
    };
    
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hóa Đơn</Text>
            {/* Form thông tin giao hàng */}
            <View style={styles.shippingInfo}>
                <Text style={styles.shippingInfoTitle}>Thông tin giao hàng</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Họ và tên"
                    value={shippingInfo.name}
                    onChangeText={text => setShippingInfo({ ...shippingInfo, name: text })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Địa chỉ giao hàng"
                    value={shippingInfo.address}
                    onChangeText={text => setShippingInfo({ ...shippingInfo, address: text })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Số điện thoại"
                    keyboardType="phone-pad"
                    value={shippingInfo.phone}
                    onChangeText={text => setShippingInfo({ ...shippingInfo, phone: text })}
                />
            </View>
            <FlatList
                data={selectedProducts}
                keyExtractor={(item, index) => `${item.productName}_${index}`}
                renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                        <Image source={{ uri: item.image }} style={styles.itemImage} />
                        <View style={styles.itemDetails}>
                            <Text style={styles.itemQuantity}>{item.quantity} x</Text>
                            <Text style={styles.itemName}>{item.productName}</Text>
                                    <View style={styles.itemContainer}>
                                        <Text style={styles.itemDiscount}>{(item.price - item.discount) * item.quantity}đ</Text>
                                        <Text style={styles.itemPrice}>{item.price}</Text>
                                    </View>
                        </View>
                    </View>
                )}
            />
            {/* Footer với tổng tiền và nút thanh toán */}
            <View style={styles.footer}>
                <Text style={styles.totalText}>Tổng Số Tiền: ${totalPrice}</Text>
                <TouchableOpacity style={styles.buttonPlaceOrder} onPress={handlePayment}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Thanh Toán</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Các phần cách đều nhau và cách nhau một khoảng
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#FF6347',
        marginTop: 10,
        marginBottom: 20,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },

    //dieu chinh item
    itemImage: {
        width: 40,
        height: 40,
        borderRadius: 10,
    },
    itemDetails: {
        flex: 1,
        flexDirection: 'row', // Hiển thị dạng hàng cho tên, số lượng và container
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    itemName: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    itemQuantity: {
        fontSize: 16,
        color: '#333',
        paddingHorizontal: 6,
    },
    itemContainer:{
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    itemPrice: {
        fontSize: 12,
        color: '#686868',
        textDecorationLine: 'line-through',
    },
    itemDiscount: {
        fontSize: 20,
        color: '#FF6347',
        fontWeight: '800'
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    
    //footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        marginTop: 20,
        paddingTop: 10,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    totalText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    buttonPlaceOrder: {
        backgroundColor: '#FF6347',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    shippingInfo: {
        marginTop: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginBottom: 20, // Để cách phần footer
    },
    shippingInfoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
});

export default Bill;
