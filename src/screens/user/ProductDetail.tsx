import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import React, { useEffect, useId, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { ScrollView } from 'react-native-virtualized-view';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

type ScreenANavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;
type Props = {
    navigation: ScreenANavigationProp;
    route: any
};

const ProductDetail: React.FC<Props> = ({ navigation, route }) => {
    //lấy data từ trang Home, key là object newData push dữ liệu từ trang Home
    const { data, userID } = route.params;
    const [quantity, setQuantity] = useState(1);
    //const [cartID, setCartID] = useState('');

    useEffect(() => {
        console.log('====================================');
        console.log('data: ' + data, 'usetID: ' + userID);
        console.log('====================================');
  }, [data, userID]);

const handleAddToCart = async () => {
    try {
        // Tìm cartID của người dùng
        let cartID;
        const userCartSnapshot = await firestore().collection('carts').where('userID', '==', userID).limit(1).get();

        if (userCartSnapshot.empty) {
            // Nếu người dùng chưa có giỏ hàng, thông báo lỗi vì khi đăng ký đã tạo giỏ hàng luôn
            Alert.alert('Lỗi', `Tài Khoản bị lỗi thông tin giỏ hàng`);

        } else {
            // Nếu người dùng đã có giỏ hàng, lấy cartID hiện có
            cartID = userCartSnapshot.docs[0].data().cartID;
            // Kiểm tra xem sản phẩm đã có trong giỏ hàng hay chưa
            const cartItemsSnapshot = await firestore()
            .collection('cartItems')
            .where('cartID', '==', cartID)
            .where('productID', '==', data.id)
            .get();

            if (!cartItemsSnapshot.empty) {
            // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
                const cartItemID = cartItemsSnapshot.docs[0].data().cartItemID;
                const currentQuantity = cartItemsSnapshot.docs[0].data().quantity;
                const newQuantity = currentQuantity + quantity;

                await firestore().collection('cartItems').doc(cartItemID).update({
                    quantity: newQuantity,
                });
                console.log('====================================');
                console.log(cartItemID);
                console.log('====================================');
                setQuantity(1)
                Alert.alert('Thành công', `Đã cập nhật số lượng ${data.name} trong giỏ hàng`);
            } else {
                // Nếu sản phẩm chưa có trong giỏ hàng, tạo mới cartItem
                const cartItemsSnapshot = await firestore().collection('cartItems').get();
                let maxCartItemID = 0;
                cartItemsSnapshot.forEach(doc => {
                    const cartItemID = parseInt(doc.data().cartItemID);
                    if (cartItemID > maxCartItemID) {
                        maxCartItemID = cartItemID;
                    }
                });

                const newCartItemID = (maxCartItemID + 1).toString();

                await firestore().collection('cartItems').doc(newCartItemID).set({
                    cartItemID: newCartItemID,
                    cartID: cartID,
                    productID: data.id,
                    quantity: quantity,
                });

                Alert.alert('Thành công', `Đã thêm ${quantity} ${data.name} vào giỏ hàng`);
            }
        }
    } catch (error) {
        console.error('Error adding to cart: ', error);
        Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng');
    }
};


    const incrementQuantity = () => {
        setQuantity(quantity + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesomeIcon name="chevron-left" size={24} color="#333" />
            </TouchableOpacity>
            <ScrollView style={styles.scrollView}>
                <Image source={{ uri: data.image }} style={styles.image} resizeMode="stretch" />
                <View style={styles.detailsContainer}>
                    <Text style={styles.productName}>{data.name}</Text>
                    <Text style={styles.productName}>{data.title}</Text>
                    
                    <Text style={styles.productPrice}>Giá: {data.price} VND</Text>
                    <Text style={styles.productDiscount}>Giảm giá: {data.discount} VND</Text>
                    <Text style={styles.productEvaluate}>Đánh giá: {data.evaluate} sao</Text>
                    <Text style={styles.productSellDay}>Ngày bán: {data.sellDay}</Text>
                    <View style={styles.quantityContainer}>
                        <Text>Số lượng:</Text>
                        <View style={styles.quantityControl}>
                            <TouchableOpacity style={styles.quantityButton} onPress={decrementQuantity}>
                                <Text style={styles.quantityButtonText}>-</Text>
                            </TouchableOpacity>
                            <TextInput
                                style={styles.quantityInput}
                                keyboardType="numeric"
                                value={String(quantity)}
                                onChangeText={(text) => setQuantity(Number(text))}
                            />
                            <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity}>
                                <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
                        <Text style={styles.addButtonText}>Thêm vào giỏ hàng</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.commentSection}>
                    <Text style={styles.commentTitle}>Bình luận</Text>
                    {/* Hiển thị bình luận ở đây */}
                </View>
                <View style={{ height: 100 }} />

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollView: {
        flexGrow: 1,
    },
    image: {
        width: '100%',
        height: Dimensions.get('window').height / 2.5,
        marginBottom: 20,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 10,
        zIndex: 1,
    },
    detailsContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginHorizontal: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333333',
    },
    productPrice: {
        fontSize: 18,
        color: '#FF0000',
        marginBottom: 10,
    },
    productDiscount: {
        fontSize: 16,
        color: '#FF6347',
        marginBottom: 10,
    },
    productEvaluate: {
        fontSize: 16,
        color: '#FFD700',
        marginBottom: 10,
    },
    productSellDay: {
        fontSize: 14,
        color: '#696969',
        marginBottom: 10,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    quantityButton: {
        width: 50,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FF6349',
        borderRadius: 5,
    },
    quantityButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    quantityInput: {
        marginLeft: 10,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 5,
        width: 50,
        height: 30,
        textAlign: 'center',
        paddingVertical: 0,
        paddingHorizontal: 5,
    },
    addButton: {
        backgroundColor: '#FF6347',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    goBackButton: {
        backgroundColor: '#CCCCCC',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    goBackButtonText: {
        color: '#333333',
        fontSize: 16,
        fontWeight: 'bold',
    },
    commentSection: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginHorizontal: 15,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    commentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
});

export default ProductDetail;
