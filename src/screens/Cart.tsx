import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Image, Button } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { colors } from '../constaints/colors';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

type ScreenANavigationProp = StackNavigationProp<RootStackParamList, 'Cart'>;
type Props = {
    navigation: ScreenANavigationProp;
    route: any;
    
};

interface CartItem {
    cartItemID: string;
    productID: string;
    quantity: number;
}

interface Product {
    productName: string;
    price: number;
    discount: number;
    image: string;
}

const Cart: React.FC<Props> = ({ navigation, route }) => {
    const { data } = route.params; // Lấy cartID từ route.params

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [products, setProducts] = useState<{ [key: string]: Product }>({});
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});

    const [totalPrice, setTotalPrice] = useState<number>(0);

    useEffect(() => {
        loadCart();
    }, []);
    useEffect(() => {
        // Tính lại tổng số tiền mỗi khi selectedItems thay đổi
        calculateTotalPrice();
    }, [selectedItems,cartItems]);
    const loadCart = async () => {
        try {
            //lấy ra danh sách cartItems dựa theo cartID
            const cartItemsSnapshot = await firestore()
                .collection('cartItems')
                .where('cartID', '==', data)
                .get(); //thực hiện truy vấn và trả về một QuerySnapshot chứa các tài liệu (documents) thỏa mãn điều kiện.

            const loadedCartItems: CartItem[] = [];

            const cartItemsPromises = cartItemsSnapshot.docs.map(async doc => {
                //Mỗi doc là một tài liệu (document) trong collection 'cartItems'.

                const cartItem: CartItem = {
                    cartItemID: doc.id,
                    productID: doc.data().productID,
                    quantity: doc.data().quantity,
                };
                loadedCartItems.push(cartItem);
            });

            await Promise.all(cartItemsPromises);
            //Promise.all(cartItemsPromises): Đợi cho tất cả các promise (các hoạt động lấy dữ liệu từ mỗi document) trong mảng cartItemsPromises hoàn thành trước khi tiếp tục.
            //Sau khi tất cả các promise được giải quyết, loadedCartItems sẽ được cập nhật với các đối tượng CartItem mới được tạo từ dữ liệu của từng document.
            setCartItems(loadedCartItems);
            if (loadedCartItems.length > 0) {

            //lấy danh sách productID dựa theo danh sách bảng cartItem
            const productIDs = loadedCartItems.map(item => item.productID);
            const productsSnapshot = await firestore()
                .collection('products')
                .where('productID', 'in', productIDs)
                .get();

            const loadedProducts: { [key: string]: Product } = {};

            const productPromises = productsSnapshot.docs.map(async doc => {
                const imageURL = doc.data().image;
                const imageRef = storage().ref().child("productFile").child(imageURL);
                const url = await imageRef.getDownloadURL();
                const product: Product = {
                    productName: doc.data().productName,
                    price: doc.data().price,
                    discount: doc.data().discount,
                    image: url,
                };
                loadedProducts[doc.data().productID] = product;
            });

            await Promise.all(productPromises);
            setProducts(loadedProducts);
        }
            setLoading(false);
        } catch (error) {
            console.error('Error loading cart items: ', error);
            Alert.alert('Lỗi', 'Không thể tải giỏ hàng');
            setLoading(false);
        }
    };
    const handleRemoveItem = async (cartItemID: string) => {
        try {
            await firestore().collection('cartItems').doc(cartItemID).delete();
            // Cập nhật lại danh sách giỏ hàng sau khi xóa
            setCartItems(prevItems => prevItems.filter(item => item.cartItemID !== cartItemID));
            Alert.alert('Thành công', 'Đã xóa sản phẩm khỏi giỏ hàng');
        } catch (error) {
            console.error('Error removing item from cart: ', error);
            Alert.alert('Lỗi', 'Không thể xóa sản phẩm khỏi giỏ hàng');
        }
    };
    const handleSelectItem = (productID: string) => {  
        setSelectedItems(prevState => ({
            ...prevState,
            [productID]: !prevState[productID],
        }));

        // Sau khi cập nhật selectedItems, tính lại tổng số tiền
        calculateTotalPrice();
    };
    const updateQuantity = async (cartItemID: string, newQuantity: number) => {
        try {
            await firestore()
                .collection('cartItems')
                .doc(cartItemID)
                .update({ quantity: newQuantity });

            // Cập nhật lại cartItems sau khi thay đổi số lượng
            const updatedCartItems = cartItems.map(item =>
                item.cartItemID === cartItemID ? { ...item, quantity: newQuantity } : item
            );
            setCartItems(updatedCartItems);
            calculateTotalPrice();

        } catch (error) {
            console.error('Error updating quantity: ', error);
            Alert.alert('Lỗi', 'Không thể cập nhật số lượng');
        }
    };

    const increaseQuantity = (cartItemID: string, currentQuantity: number) => {
        const newQuantity = currentQuantity + 1;
        updateQuantity(cartItemID, newQuantity);
    };

    const decreaseQuantity = (cartItemID: string, currentQuantity: number) => {
        if (currentQuantity > 1) {
            const newQuantity = currentQuantity - 1;
            updateQuantity(cartItemID, newQuantity);
        } else {
            Alert.alert('Lỗi', 'Số lượng không thể nhỏ hơn 1');
        }
    };

    const calculateTotalPrice = () => {
        const selectedProducts = cartItems.filter(item => selectedItems[item.productID]);
        const total = selectedProducts.reduce((sum, item) => {
            const product = products[item.productID];
            return sum +( (product.price - product.discount) * item.quantity);
        }, 0);
        setTotalPrice(total);
    };
    const handlePlaceOrder = () => {
        const selectedProducts = cartItems.filter(item => selectedItems[item.productID]);

        // Chuyển sang trang hóa đơn và truyền dữ liệu
         navigation.navigate('Bill', { data: selectedProducts, total: totalPrice});
        Alert.alert('Đặt hàng thành công');
        console.log('====================================');
        console.log(selectedProducts);
        console.log('====================================');
    }
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Đang tải giỏ hàng...</Text>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Giỏ Hàng Của Bạn</Text>
            {cartItems.length === 0 ? (
            <Text style={styles.title}>Giỏ hàng của bạn đang trống!</Text>
        ) : 
           ( <>
               <FlatList
                    data={cartItems}
                    keyExtractor={item => item.cartItemID}
                    renderItem={({ item }) => {
                        const product = products[item.productID];
                        if (!product) return null; // Tránh lỗi khi product chưa được tải
    
                        return (
                            <View style={styles.cartItem}>
                                <Button 
                                    title={selectedItems[item.productID] ? "Bỏ Chọn" : "Chọn"} 
                                    onPress={() => handleSelectItem(item.productID)} 
                                />
                                
                                <Image source={{ uri: product.image }} style={styles.itemImage} />
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemName}>{product.productName}</Text>
                                    <Text style={styles.itemQuantity}>Số Lượng: {item.quantity}</Text>
                                    <Text style={styles.itemPrice}>Giá Gốc: ${product.price}</Text>
                                    <Text style={styles.itemPrice}>Giảm Giá: ${product.discount}</Text>
                                    <Text style={styles.itemPrice}>Thành Tiền: ${(product.price - product.discount) * item.quantity}</Text>
                                    <View style={styles.quantityControls}>
                                        <Button title="-" onPress={() => decreaseQuantity(item.cartItemID, item.quantity)} />
                                        <Text>{item.quantity}</Text>
                                        <Button title="+" onPress={() => increaseQuantity(item.cartItemID, item.quantity)} />
                                    </View>
                                </View>
                                <Button 
                                            title="Xóa" 
                                            onPress={() => handleRemoveItem(item.cartItemID)} 
                                            color="red"
                                        />
                            </View>
                            
                        );
                    }}
                />
                <View style={styles.footer}>
                <Text style={styles.totalText}>Tổng Số Tiền: ${totalPrice}</Text>
                <Button title="Đặt Hàng" onPress={handlePlaceOrder} />
            </View>
            </>
            )}


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        padding: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    itemImage: {
        width: 80,
        height: 80,
        marginRight: 10,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemQuantity: {
        fontSize: 14,
        color: '#333',
    },
    itemPrice: {
        fontSize: 14,
        color: '#FF6347',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
},
totalText: {
    fontSize: 16,
    fontWeight: 'bold',
},
});

export default Cart;
