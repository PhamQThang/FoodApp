
import React, { useEffect, useState } from "react";
import { Alert, Button, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import storage from '@react-native-firebase/storage';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import firestore from '@react-native-firebase/firestore';
import FooterAdmin from "../../components/FooterAdmin";
import { launchImageLibrary } from "react-native-image-picker";
type ScreenANavigationProp = StackNavigationProp<RootStackParamList, 'AddProduct'>;
type Props = {
    navigation: ScreenANavigationProp;
  route: any

  };
const AddProduct:React.FC<Props>=({route,navigation}) =>{
    const {data,user} = route.params;
        const [productname, setProductname] = useState('');
        
        const [price, setPrice] = useState('');
        const [discount, setDiscount] = useState('');
        const [evaluate, setEvaluate] = useState('');
        const [avatar, setAvatar] = useState(null);
        const [title, setTitle] = useState('');
        const [tang,setTang] = useState('');
        const [IMGuri,setIMGuri]=useState("");
       
        const parseDate = (dateString: any) => {
            const [day, month, year] = dateString.split('/').map(Number);
            return new Date(year, month - 1, day);
        };
    
        const formatDate = (dateString: any) => {
            const [day, month, year] = dateString.split('/');
            return `${day}/${month}/${year}`;
        };
            const handleSaveProduct = async () => {
                tangid();
              try {
                console.log(tang+productname)
                if(data==='default'){
                    await firestore().collection('products').add({
                        productID: tang,
                        productName: productname,
                        price: Number(price),
                        image: tang+productname+'.jpg',
                        discount:discount,
                        evaluate:evaluate,
                        title:title,
                        sellDay: new Date().toLocaleDateString('vi-VN'),
                        sellNumber: "0"
                      });
                }else{
                    
                    await firestore().collection('products').doc(data.id).update({
                        productID: tang,
                        productName: productname,
                        price: Number(price),
                        image: tang+productname+'.jpg',
                        discount:discount,
                        evaluate:evaluate,
                        title:title,
                      });
                      
                }
                
                
                console.log('Product saved to Firestore');
              } catch (error) {
                console.error('Error saving product to Firestore:', error);
              }
              
              Uploading(IMGuri)
              setTang('1')
              navigation.navigate('ManageProduct',{data:data})
            };
          
    
    const selectImage = () => {
        launchImageLibrary({}, (response) => {
            if (response.assets && response.assets.length > 0) {
                setAvatar(response.assets[0].uri);
                setIMGuri(response.assets[0].uri);

            }
        });
    };
    const Uploading =async (uri: string)=>{

        try {
            const imageName = tang+productname+'.jpg'; // Lấy tên ảnh từ biến NameIMG
           
            const imageUri = `file://${uri}`; // Đường dẫn đầy đủ của file ảnh trên thiết bị
    
            // Tạo tham chiếu đến thư mục "Profile" trên Firebase Storage
            const storageRef = storage().ref().child("productFile").child(imageName);
            console.log(storageRef+'jgvfgfjfuyggiyg')
            // Upload file
            await storageRef.putFile(imageUri); // Upload tệp ảnh từ đường dẫn `imageUri` lên Firebase Storage
            console.log('Image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            // Xử lý lỗi khi tải lên không thành công
        }
    }
    
    useEffect( ()=>{
        //console.log(data.image)
        tangid();
        if(data!='default'){
            suaProduct();
        }
        
    },[tang])
    
    async function suaProduct(){
        setProductname(data.name)
        setPrice(data.price)
        setDiscount(data.discount)
        setEvaluate(data.evaluate)
        setTitle(data.title)
        setAvatar(data.image) 
    }
    async function tangid(){
        const snapshot = await firestore().collection('products').orderBy('productID', 'desc').limit(1).get();
            let newProductID = 1;
            if (!snapshot.empty) {
                const lastProduct = snapshot.docs[0].data();
                newProductID = parseInt(lastProduct.productID) + 1;
            }
            setTang(newProductID.toString());
    }
    return(
        <SafeAreaView style={styles.safeArea}>
            <TouchableOpacity style={styles.goBack} onPress={() => navigation.goBack()}>
                <Text>Trở về</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={selectImage}>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>Select Image</Text>
                            </View>
                        )}
                    </TouchableOpacity>
             <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="ProductName"
                value={productname}
                onChangeText={(newText)=>{
                    setProductname(newText)
                }}
            />
            <TextInput
                style={styles.input}
                placeholder="Price"
                value={price}
                onChangeText={(newText)=>{
                    setPrice(newText)
                }}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Discount"
                value={discount}
                onChangeText={(newText)=>{
                    setDiscount(newText)
                }}
            />
            <TextInput
                style={styles.input}
                placeholder="Evaluate"
                value={evaluate}
                onChangeText={(newText)=>{
                    setEvaluate(newText)
                }}
            />
            <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={(newText)=>{
                    setTitle(newText)
                }}
            />
            
            <TouchableOpacity style={styles.button} onPress={handleSaveProduct}>
                <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
        </View>
        <FooterAdmin navigation={navigation} data={data}/>
        </SafeAreaView>
    );
        
    
}
const styles = StyleSheet.create({
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
    },
    avatarText: {
        color: '#ffffff',
    },
    goBack:{
        padding: 10,
        fontSize: 16,
    },
    avatarPlaceholder: {
        marginTop: 20,
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        backgroundColor: '#cccccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    input: {
        height: 40,
        borderColor: '#cccccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    textDanhgia:{
        fontSize:18,
        paddingLeft:10,
    },
    Container:{
        paddingTop:20,
    },
    evaContainer:{
        backgroundColor:'#fff',
        paddingBottom:10,
    },
    button:{
        
        width:'100%',
        backgroundColor:'orange',
        height:30,
    },
    buttonText:{
        fontSize:20,
        alignSelf:'center'
    },
    scrollView:{
        paddingTop:10,
    },
    
    fooditemContainer:{
        paddingTop:10,
        flexDirection: 'row',
        backgroundColor:'#fff',
        width:450,
    },
    foodImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    foodName: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    foodPrice: {
        marginTop: 5,
        fontSize: 14,
        color: 'red',
    },
    safeArea: {
        flex: 1,
        backgroundColor:'white',
    },
    image: {
        width: 450,
        height: 150,
    },
    buttonContainer:{
        marginTop:10,
        flexDirection: 'row',
        width: '100%',
        alignItems:'center',
        backgroundColor:'#fff',
        paddingLeft:15,
    },
    buttonBottom:{
        fontSize:20,
        padding: 12
    },
    buttonPush:{
        fontSize:20,
        padding: 12,
    },
    buttonPush1:{
        fontSize:20,
        padding: 12,
        fontStyle:'italic'
    },
    footer: {
        alignContent:'space-between',
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        width: '100%',
        backgroundColor: '#fff',
        borderColor: '#ccc',
        height:70,
        alignItems:'center',
        
        
    },
    iconItemBottom:{
        marginLeft:30,
    },
    iconBottom: {
        marginLeft: 40,
        marginTop:12,
        alignContent:'center',
        alignItems:'center',
        fontSize:35,
    },
    
});
export default AddProduct; 



