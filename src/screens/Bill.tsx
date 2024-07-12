import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

interface Product {
    productName: string;
    price: number;
    discount: number;
    quantity: number;
}

interface Props {
    route: any; // Để nhận dữ liệu từ Cart.tsx qua navigation
}

const Bill: React.FC<Props> = ({ route }) => {
    const { selectedProducts, totalPrice } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hóa Đơn</Text>
            <FlatList
                data={selectedProducts}
                keyExtractor={(item, index) => `${item.productName}_${index}`}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text>{item.productName}</Text>
                        <Text>Số lượng: {item.quantity}</Text>
                        <Text>Giá: ${item.price}</Text>
                        <Text>Giảm giá: ${item.discount}</Text>
                        <Text>Thành tiền: ${(item.price - item.discount) * item.quantity}</Text>
                    </View>
                )}
            />
            <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Tổng cộng: ${totalPrice}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    item: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingVertical: 10,
    },
    totalContainer: {
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        marginTop: 10,
        paddingTop: 10,
        alignItems: 'flex-end',
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Bill;
