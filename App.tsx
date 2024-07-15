import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Login from './src/screens/login/Login';
import Register from './src/screens/login/Register';
import Home from './src/screens/user/Home';
import Information from './src/screens/user/Information';
import Invoice from './src/screens/user/Invoice';
import Cart from './src/screens/user/Cart';
import ProductDetail from './src/screens/user/ProductDetail';
import Bill from './src/screens/user/Bill';
const Stack = createNativeStackNavigator();
export type RootStackParamList = {
  Login: { data?: any }; // ScreenA có thể nhận dữ liệu là một chuỗi tùy chọn
  Register: { data?: any }; // ScreenB có thể nhận dữ liệu là một chuỗi tùy chọn
  Home: { data?: any, userID?:any }; // ScreenB có thể nhận dữ liệu là một chuỗi tùy chọn
  HomePage: { data?: any }; // ScreenB có thể nhận dữ liệu là một chuỗi tùy chọn
  Information : { data?: any };
  Invoice : { userID?: any, orderID?: any};
  Cart: { data?: any };
  Bill: { data?: any, selectedProducts?: any, totalPrice ?: any };
  ProductDetail: { data?: any, userID?: any };
};
const App: React.FC = () => {
  return (
    <NavigationContainer>
    <Stack.Navigator screenOptions={{headerShown:false}} initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Information" component={Information} />
      <Stack.Screen name="Invoice" component={Invoice} />
      <Stack.Screen name="Cart" component={Cart} />
      <Stack.Screen name="ProductDetail" component={ProductDetail} />
      <Stack.Screen name="Bill" component={Bill} />
    </Stack.Navigator>
  </NavigationContainer>
  )
}

export default App