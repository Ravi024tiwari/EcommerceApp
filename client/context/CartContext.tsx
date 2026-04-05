import { dummyCart } from "@/assets/assets";
import api from "@/constants/api";
import { Product, WishlistContextType } from "@/constants/types";
import { useAuth } from "@clerk/expo";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

export type CartItem ={
  id:string;
  productId:string;
  product:Product;
  quantity:number;
  size:string;
  price:number;
}

type CartContextType ={
  cartItems:CartItem[],
  addToCart :(product:Product,size:string)=> Promise<void>;
  removeFromCart: (itemId:string,size:string) => Promise<void>;
  updateQuantity :(item:string,quantity:number,size:string) =>Promise<void>;
  clearCart:()=>Promise<void>;
  cartTotal:number;
  itemCount:number;
  isLoading:boolean
}


const CartContext =createContext<CartContextType| undefined>(undefined)


export function CartProvider({children}:{children:ReactNode}){
   const {getToken,isSignedIn} =useAuth();
   const [cartItems,setCartItems] =useState<CartItem[]>([]);//here we set that cartItem should be inserted into It
   const [isLoading,setisLoading] =useState(false)
   const [cartTotal,setCartTotal] =useState(0);// here we set the total carts that we store on our App

   const fetchCart =async()=>{
    try {
      setisLoading(true);
      const token =await getToken();

      const {data} =await api.get('/cart',{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })

      console.log('The cart data of the user:',data)// here its fetch the cart data

      if(data.success && data.data){
       const serverCart =data.data;

       const mappedItems:CartItem[] =serverCart.items.map((item:any)=>({
       id:item.product._id,
       productId:item.product._id,
       product:item.product,
       quantity:item.quantity,
       size:item?.size || 'M',
       price:item.price
       }));

       setCartItems(mappedItems);//here we set that cartItems
       setCartTotal(serverCart.totalAmount)
      
      }
     
    } catch (error:any) {
      console.error('Failed to fetch cart:',error)
    }
    finally{
       setisLoading(false)
    }
    
   }
   
   const addToCart =async(product:Product,size:string)=>{
    if(!isSignedIn){
      return Toast.show({
        type:'error',
        text1:'Please login first'
      })
    }

    try {
      // here the user will add the product into the cart
      setisLoading(true)
      const token =await getToken();//here we get that token from the backend
      const {data} =await api.post('/cart/add',{
           productId:product._id,quantity:1,size},
           {headers:{
            Authorization:`Bearer ${token}`
           }})

           if(data.success){
            await fetchCart();//here its fetch that cart data
           }
    } catch (error:any) {
      console.error('Failed to add to cart the product:',error)
      Toast.show({
        type:'error',
        text1:'Failed to fetch the add the product into cart'
      })
    }
    finally{
      setisLoading(false)
    }
   }

   const removeFromCart =async(productId:string,size:string)=>{
      //Here its remove the items from the cart 
      if(!isSignedIn) return ;
      try {
        setisLoading(true)
        const token = await getToken();

        const {data} =await api.delete(`/cart/item/${productId}?size=${size}`,{
          headers:{
            Authorization:`Bearer ${token}`
          }
        })

        if(data.success){
          await fetchCart();//here its delete items from the car
        }
        
      } catch (error:any) {
        console.error("Failed to remove items from Cart:",error)
      }
      finally{
        setisLoading(false)
      }
   }

   const updateQuantity =async(productId:string,quantity:number,size:string='M')=>{
        if(!isSignedIn) return ;//agar vo phle se login nhi hai to 
        if(quantity<1) return ;//no change
        try {
          setisLoading(true)
          const token = await getToken();

          const {data} =await api.put(`/cart/item/${productId}`,{
              quantity,size},
            {headers:{Authorization:`Bearer ${token}`}})

            console.log("The update Quantity of product in cart:",data)

        if(data.success){
          await fetchCart();
        }
        } catch (error) {
          console.error("Failed to update the quantity:",error)
        }
        finally{
          setisLoading(false)
        }
   }

   const clearCart =async()=>{
      if(!isSignedIn) return;
      try {
         setisLoading(true);
         const token = await getToken();

         const {data} =await api.delete("/cart/clear",{
          headers:{Authorization:`Bearer ${token}`}
         })

         if(data.success){ //here its already clear that cart
          setCartItems([]);//here we empty that cart
          setCartTotal(0);
         }

      } catch (error) {
        console.error("Failed to clear cart",error)
      }
      finally{
        setisLoading(false)
      }
   }

   const itemCount =cartItems.reduce((sum,item)=>sum +item.quantity,0);//here its return the sum of count of items into that cart

   useEffect(()=>{
    if(isSignedIn) fetchCart()
    else{
      setCartItems([])
      setCartTotal(0)
  }
   },[isSignedIn])
  return (
    // these are the data that we pass through context into all child component
    <CartContext.Provider value={{cartItems,addToCart,removeFromCart,updateQuantity,clearCart,cartTotal,itemCount,isLoading}}>
        {children}
    </CartContext.Provider>
  )
}

export function useCart(){

    const context =useContext(CartContext)

    if(context===undefined){
        throw new Error('useCart must be used within a cartContextProduct..')
    }

    return context
}