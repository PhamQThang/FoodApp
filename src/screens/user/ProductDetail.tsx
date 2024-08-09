import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, Image, Dimensions, Alert, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

type ScreenANavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;
type Props = {
    navigation: ScreenANavigationProp;
    route: any
};

const ProductDetail: React.FC<Props> = ({ navigation, route }) => {
    const { data, userName, userID } = route.params;
    const [quantity, setQuantity] = useState(1);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [editingCommentID, setEditingCommentID] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');

    useEffect(() => {
        console.log('data: ' + data, 'userName: ' + userName);
        fetchComments();
    }, [data, userID]);

    const fetchComments = async () => {
        try {
            const commentsSnapshot = await firestore().collection('comments')
                .where('productID', '==', data.id)
                .get();

            const commentsList = commentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setComments(commentsList);
        } catch (error) {
            console.error('Error fetching comments: ', error);
        }
    };

    const handleAddToCart = async () => {
        try {
            let cartID;
            const userCartSnapshot = await firestore().collection('carts').where('userID', '==', userID).limit(1).get();

            if (userCartSnapshot.empty) {
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
                    setQuantity(1);
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

    const handleAddComment = async () => {
        if (!comment.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập bình luận');
            return;
        }

        const timestamp = new Date();
        const formattedTime = `${timestamp.toLocaleTimeString('vi-VN')} ${timestamp.toLocaleDateString('vi-VN')}`;

        try {
            await firestore().collection('comments').add({
                productID: data.id,
                userID: userID,
                userName: userName,
                comment: comment,
                timestamp: formattedTime,
            });

            setComment('');
            fetchComments();
        } catch (error) {
            console.error('Error adding comment: ', error);
            Alert.alert('Lỗi', 'Không thể thêm bình luận');
        }
    };

    const handleEditComment = async (commentID) => {
        if (!editingCommentText.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập bình luận');
            return;
        }
        const timestamp = new Date();
        const formattedTime = `${timestamp.toLocaleTimeString('vi-VN')} ${timestamp.toLocaleDateString('vi-VN')}`;

        try {
            await firestore().collection('comments').doc(commentID).update({
                comment: editingCommentText,
                timestamp: formattedTime,
            });

            setEditingCommentID(null);
            setEditingCommentText('');
            fetchComments();
        } catch (error) {
            console.error('Error editing comment: ', error);
            Alert.alert('Lỗi', 'Không thể sửa bình luận');
        }
    };

    const handleDeleteComment = async (commentID) => {
        try {
            await firestore().collection('comments').doc(commentID).delete();
            fetchComments();
        } catch (error) {
            console.error('Error deleting comment: ', error);
            Alert.alert('Lỗi', 'Không thể xóa bình luận');
        }
    };

    const renderCommentItem = ({ item }) => (
        <View style={styles.commentItem}>
            <Text style={styles.commentUserID}>{item.userName}</Text>
            <Text style={styles.commentTimestamp}>{item.timestamp}</Text>
            {editingCommentID === item.id ? (
                <TextInput
                    style={styles.commentInput}
                    value={editingCommentText}
                    onChangeText={setEditingCommentText}
                    onSubmitEditing={() => handleEditComment(item.id)}
                />
            ) : (
                <Text style={styles.commentText}>{item.comment}</Text>
            )}
            {item.userID === userID && (
                <View style={styles.commentActions}>
                    {editingCommentID === item.id ? (
                        <>
                            <TouchableOpacity onPress={() => handleEditComment(item.id)}>
                                <Text style={styles.saveButton}>Lưu</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setEditingCommentID(null); setEditingCommentText(''); }}>
                                <Text style={styles.cancelButton}>Hủy</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity onPress={() => { setEditingCommentID(item.id); setEditingCommentText(item.comment); }}>
                                <Text style={styles.editButton}>Sửa</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
                                <Text style={styles.deleteButton}>Xóa</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )}
        </View>
    );

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
            <FlatList
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <>
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
                    </>
                }
                contentContainerStyle={styles.commentList}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
                style={styles.commentInputContainer}
            >
                <TextInput
                    style={styles.commentInput}
                    placeholder="Nhập bình luận của bạn..."
                    value={comment}
                    onChangeText={setComment}
                />
                <TouchableOpacity style={styles.commentButton} onPress={handleAddComment}>
                    <Text style={styles.commentButtonText}>Gửi</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5',
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
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderColor: '#CCCCCC',
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
    },
    commentButton: {
        backgroundColor: '#FF6347',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    commentButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    commentList: {
        paddingBottom: 80,
    },
    commentItem: {
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    commentUserID: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    commentText: {
        fontSize: 14,
        color: '#333',
    },
    commentActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 5,
    },
    editButton: {
        color: '#FFA500',
        marginRight: 10,
    },
    deleteButton: {
        color: '#FF0000',
    },
    saveButton: {
        color: '#008000',
        marginRight: 10,
    },
    cancelButton: {
        color: '#FF6347',
    },
    commentTimestamp: {
        fontSize: 12,
        color: '#888888',
        marginBottom: 5,
    },
});

export default ProductDetail;


