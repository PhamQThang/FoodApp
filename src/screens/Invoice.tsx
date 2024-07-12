import { NavigationProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

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
    const [evaluate, setEvaluate] = useState('');
    const { data } = route.params || { data: 'Default Value' };
    const [status, setStatus] = useState('Đã Đặt');
    const [cartItems, setCartItems] = useState<FoodItem[]>([]);
    // const [FoodItems, setFoodItems] = useState<{ [key: string]: FoodItem[] }>({
    //     'Đã Đặt': [],
    //     'Đã Giao': [],
    //     'Đã Hủy': [],
    // });

    const fetchCarts = async () => {
        try {
            const snapshot = await firestore().collection('carts').get();
            const newData: { [key: string]: FoodItem[] } = { 'Đã Đặt': [], 'Đã Giao': [], 'Đã Hủy': [] };

            for (const doc of snapshot.docs) {
                if (data.userID === doc.data().userID) {
                    const product = doc.data().productID;
                    const product_FB = await firestore().collection('products').get();

                    for (const doc1 of product_FB.docs) {
                        if (product === doc1.data().productID) {
                            const name = doc1.data().productName;
                            const price = doc1.data().price;
                            const imageURL = doc1.data().image; // Đảm bảo rằng bạn lấy image từ doc1, không phải doc

                            if (!imageURL) {
                                console.error('Image URL is undefined for product:', doc1.data().productID);
                                continue; // Bỏ qua sản phẩm này nếu không có imageURL
                            }

                            const imageRef = storage().ref().child("productFile").child(imageURL);
                            try {
                                const url = await imageRef.getDownloadURL();
                                newData[doc.data().status].push({ id: doc1.data().productID, name: name, price: price, image: { uri: url } });
                            } catch (error) {
                                console.error('Error getting image URL:', error);
                                Alert.alert('Error', 'Failed to load image from Firebase Storage');
                            }
                        }
                    }
                }
            }

           // setFoodItems(newData);
            setCartItems(newData[status]);
        } catch (error) {
            console.error('Error fetching carts:', error);
        }
    };

    useEffect(() => {
        fetchCarts()
    }, [status]);

    const handleNavigation = (page: string) => {
        setStatus(page);
    };

    const handleHomePage = () => {
        navigation.navigate('Home', { data: data });
    };

    const renderFoodItem = ({ item }: { item: FoodItem }) => {
        return (
            <View style={styles.container}>
                <View key={item.id} style={styles.foodItem}>
                    <Image source={item.image} style={styles.foodImage} />
                    <View>
                        <Text style={styles.foodName}>{item.name}</Text>
                        <Text style={styles.foodPrice}>{item.price}</Text>
                    </View>
                </View>
                <View style={styles.evaluationContainer}>
                    <TextInput
                        style={styles.input}
                        value={evaluate}
                        onChangeText={setEvaluate}
                        placeholder="Nhập đánh giá của bạn"
                        multiline={true}
                        numberOfLines={4}
                    />
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Gửi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerIcon} onPress={handleHomePage}>
                    <FontAwesomeIcon name="arrow-left" size={50} color='#FF0000' style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Đơn Hàng</Text>
            </View>
            <View style={styles.listButton}>
                <TouchableOpacity onPress={() => handleNavigation('Đã Đặt')}>
                    <Text style={[styles.itemButton, status === 'Đã Đặt' && styles.activeButton]}>Đã Đặt</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleNavigation('Đã Giao')}>
                    <Text style={[styles.itemButton, status === 'Đã Giao' && styles.activeButton]}>Đã Giao</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleNavigation('Đã Hủy')}>
                    <Text style={[styles.itemButton, status === 'Đã Hủy' && styles.activeButton]}>Đã Hủy</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={cartItems}
                renderItem={renderFoodItem}
                keyExtractor={item => item.id}
                horizontal={false}
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
            />
            <View style={styles.container}>
                <Text>Trang Chủ</Text>
                <Text>Dữ liệu nhận được: {JSON.stringify(data)}</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scrollView: {
        paddingBottom: 60,
    },
    header: {
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 16,
        color: '#000',
    },
    headerIcon: {
        position: 'absolute',
        left: 0,
        marginLeft: 10,
        padding: 6,
    },
    icon: {
        fontSize: 15,
        padding: 4,
    },

    //btn
    listButton: {
        marginTop: 10,
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#fff',
        justifyContent: 'space-evenly',
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
    container: {
        padding: 10,
        backgroundColor: '#fff',
    },
    foodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    foodImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    foodName: {
        fontSize: 16,
        fontWeight: 'bold',
        flexWrap: 'wrap',
    },
    foodPrice: {
        fontSize: 14,
        color: 'red',
    },
    evaluationContainer: {
        marginTop: 10,
    },
    input: {
        height: 100,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        textAlignVertical: 'top',
    },
    button: {
        alignSelf: 'flex-end',
        backgroundColor: 'red',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default Invoice;
