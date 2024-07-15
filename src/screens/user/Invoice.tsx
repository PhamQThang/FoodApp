import { NavigationProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { ScrollView } from "react-native-virtualized-view";

interface Props {
    navigation: NavigationProp<any>;
    route: any;
};

interface FoodItem {
    id: string;
    name: string;
    price: string;
    image: any;
}
const Invoice: React.FC<Props> = ({ navigation, route }) => {
    const { data } = route.params;
    const [orderStatus, setOrderStatus] = useState('Đã Đặt');
    const [orderList, setOrderList] = useState<any[]>([]);

    const fetchOrders = async () => {
        try {
            const orderSnapshot = await firestore()
                .collection('orders')
                .where('userID', '==', data.userID)
                .where('status', '==', orderStatus)
                .get();
    
            if (orderSnapshot.empty) {
                console.log('No matching orders.');
                setOrderList([]);
                return;
            }
    
            const orders = [];
            for (const doc of orderSnapshot.docs) {
                const orderData = doc.data();
                const orderDetailsSnapshot = await firestore()
                    .collection('orderDetails')
                    .where('orderID', '==', doc.id)
                    .get();
    
                const products = [];
                for (const detailDoc of orderDetailsSnapshot.docs) {
                    const detailData = detailDoc.data();
                    
                    const productSnapshot = await firestore()
                        .collection('products')
                        .where('productID', '==', detailData.productID)
                        .get();
    
                        //lấy ra danh sách sản phẩm
                    if (!productSnapshot.empty) {
                        const productData = productSnapshot.docs[0].data();
                        console.log('====================================');
                        console.log(productData);
                        console.log('====================================');
                        if (productData) {
                            const imageRef = storage()
                                .ref()
                                .child("productFile")
                                .child(productData.image);
                            const url = await imageRef.getDownloadURL();
    
                            products.push({
                                id: detailData.productID,
                                quantity: detailData.quantity,
                                name: productData.productName,
                                price: detailData.price,
                                image: { uri: url },
                            });
                        } else {
                            console.log('Product data is null for productID:', detailData.productID);
                        }
                    } else {
                        console.log('No product found for productID:', detailData.productID);
                    }
                }
    
                //đây là thêm danh sách orderDetail
                orders.push({
                    orderID: orderData.orderID,
                    orderDate: orderData.orderDate,
                    totalAmount: orderData.totalAmount,
                    status: orderData.status,
                    products: products,
                });

            }
    
            setOrderList(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };
    

    useEffect(() => {
        fetchOrders();
    }, [orderStatus]);

    const handleStatusChange = (status: string) => {
        setOrderStatus(status);
    };

    const renderOrderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.orderItem} onPress={() => navigation.navigate('Invoice', { data: data})}>
            <Text style={styles.orderID}>Mã đơn hàng: {item.orderID}</Text>
            <Text style={styles.orderDate}>Ngày đặt hàng: {item.orderDate}</Text>
            <Text style={styles.totalAmount}>Tổng số tiền: {item.totalAmount}đ</Text>
            <Text style={styles.status}>Trạng thái: {item.status}</Text>
            <View >
                <FlatList
                    data={item.products}
                    keyExtractor={(product) => product.id}
                    renderItem={({ item }) => (
                        <View style={styles.productItem}>
                            <Image source={item.image} style={styles.productImage} />
                            <View style={styles.productDetails}>
                            <Text style={styles.productQuantity}>{item.quantity} x</Text>
                                <Text style={styles.productName}>{item.name}</Text>
                                <Text style={styles.productPrice}>{item.price}đ</Text>
                            </View>
                        </View>
                    )}
                    horizontal={false}
                    showsHorizontalScrollIndicator={true}
                />
            </View>
        </TouchableOpacity>
    );
    

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesomeIcon name="chevron-left" size={24} color="#FF0000" />
            </TouchableOpacity>
            <View style={styles.statusContainer}>
                <TouchableOpacity onPress={() => handleStatusChange('Đã Đặt')}>
                    <Text style={[styles.statusButton, orderStatus === 'Đã Đặt' && styles.activeStatus]}>Đã Đặt</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleStatusChange('Đã Hủy')}>
                    <Text style={[styles.statusButton, orderStatus === 'Đã Hủy' && styles.activeStatus]}>Đã Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleStatusChange('Đã Giao')}>
                    <Text style={[styles.statusButton, orderStatus === 'Đã Giao' && styles.activeStatus]}>Đã Giao</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={orderList}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.orderID}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 0,
        zIndex: 1,
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    statusButton: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingVertical: 10,
        paddingHorizontal: 20,
        color: '#333',
    },
    activeStatus: {
        color: 'red',
    },
    orderItem: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    orderID: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    orderDate: {
        fontSize: 14,
        color: '#666',
    },
    totalAmount: {
        fontSize: 14,
        color: '#666',
    },
    status: {
        fontSize: 14,
        color: '#666',
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        justifyContent: 'space-between'
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginRight: 10,
    },
    productQuantity: {
        fontSize: 16,
        color: '#333',
        paddingHorizontal: 6,
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    productPrice: {
        fontSize: 12,
        color: '#FF6347',
    },
});

export default Invoice;