import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Image, Button, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { colors } from '../../constaints/colors';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import CheckBox from '@react-native-community/checkbox';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

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
        console.log('====================================');
        console.log(data);
        console.log('====================================');
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
                    cartItemID: doc.data().cartItemID,
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
        if(totalPrice === 0) {
            Alert.alert('Đặt Hàng', 'Vui lòng chọn món ăn trước khi đặt hàng!');
        }
        else {
            const selectedProducts = cartItems
            .filter(item => selectedItems[item.productID])
            .map(item => {
                const product = products[item.productID];
                console.log('====================================');
                console.log('cartitemid:       ' + item.cartItemID);
                console.log('====================================');
                return {
                    cartItemID: item.cartItemID,
                    productID: item.productID,
                    productName: product.productName,
                    image: product.image,
                    quantity: item.quantity,
                    price: product.price,
                    discount: product.discount,
                    totalPrice: (product.price - product.discount) * item.quantity,
                };
            });

            navigation.navigate('Bill', { data, selectedProducts, totalPrice });
        }
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
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesomeIcon name="chevron-left" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Giỏ Hàng Của Bạn</Text>
            {cartItems.length === 0 ? (
            <Text style={styles.emptyCartText}>Giỏ hàng của bạn đang trống!</Text>
            ) : ( <>
               <FlatList
                    data={cartItems}
                    keyExtractor={item => item.cartItemID}
                    renderItem={({ item }) => {
                        const product = products[item.productID];
                        if (!product) return null; // Tránh lỗi khi product chưa được tải
    
                        return (
                            <View style={styles.cartItem}>
                                <CheckBox
                                    value={selectedItems[item.productID]}
                                    onValueChange={() => handleSelectItem(item.productID)}
                                    tintColors={{ true: '#F15927', false: 'black' }}
                                    />
                                <Image source={{ uri: product.image }} style={styles.itemImage} />
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemName}>{product.productName}</Text>
                                    <View style={styles.itemContainer}>
                                        <Text style={styles.itemDiscount}>đ{product.price - product.discount}</Text>
                                        <Text style={styles.itemPrice}>{product.price}</Text>
                                    </View>
                                    <Text style={styles.itemTotal}>Thành Tiền: ${(product.price - product.discount) * item.quantity}</Text>
                                    <View style={styles.quantityControls}>
                                        <View style={styles.controlAccount}>
                                        <TouchableOpacity onPress={() => decreaseQuantity(item.cartItemID, item.quantity)} style={styles.buttonControl}>
                                            <Text style={styles.buttonText}>-</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.quantity}>{item.quantity}</Text>
                                        <TouchableOpacity onPress={() => increaseQuantity(item.cartItemID, item.quantity)} style={styles.buttonControl}>
                                            <Text style={styles.buttonText}>+</Text>
                                        </TouchableOpacity>
                                        </View>
                                        <TouchableOpacity onPress={() => handleRemoveItem(item.cartItemID)} style={styles.buttonRemove}>
                                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Xóa</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                            </View>
                            
                        );
                    }}
                />
                <View style={styles.footer}>
                    <Text style={styles.totalText}>Tổng Số Tiền: {totalPrice}đ</Text>
                    <TouchableOpacity style={styles.buttonPlaceOrder} onPress={handlePlaceOrder}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Đặt Hàng</Text>
                    </TouchableOpacity>
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
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#FF6347',
    },
    emptyCartText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        color: '#333',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 10,
        zIndex: 1,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
        paddingVertical: 10,
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
    itemImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginRight: 10,
        resizeMode: 'stretch'
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    itemQuantity: {
        fontSize: 16,
        color: '#333',
    },
    itemContainer:{
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemPrice: {
        fontSize: 12,
        color: '#686868',
        textDecorationLine: 'line-through',
        marginLeft: 10
    },
    itemDiscount: {
        fontSize: 20,
        color: '#FF6347',
        fontWeight: '800'
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6347',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
        paddingRight: 20
    },
    controlAccount:{
        flexDirection: 'row',
        alignItems: 'center',

    },
    buttonControl: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingVertical: 4,
    },
    buttonText: {
        fontSize: 18,
        color: 'black',
        fontWeight: 'bold',
    },
    quantity: {
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
    },
    buttonRemove: {
        backgroundColor: '#FF6347',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        marginLeft: 10,
    },
    footer: {
        flexDirection: 'row', // Đảm bảo các thành phần trong footer nằm ngang
        justifyContent: 'space-between', // Các phần tử trong footer căn chỉnh cách đều nhau
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        marginTop: 20,
        paddingTop: 10,
        alignItems: 'center',
        paddingHorizontal: 10, // Thêm padding nếu cần thiết
    },
    totalText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    buttonPlaceOrder: {
        backgroundColor: 'red',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Cart;
