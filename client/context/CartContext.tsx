import { dummyCart } from "@/assets/assets";
import { Product, WishlistContextType } from "@/constants/types";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

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


const CartContenxt =createContext<CartContextType| undefined>(undefined)


export function CartProvider({children}:{children:ReactNode}){
   
   const [cartItems,setCartItems] =useState<CartItem[]>([]);//here we set that cartItem should be inserted into It
   const [isLoading,setisLoading] =useState(false)
   const [cartTotal,setCartTotal] =useState(0);// here we set the total carts that we store on our App

   const fetchCart =async()=>{
    setisLoading(true)
    const serverCart =dummyCart;

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
    setisLoading(false)
   }
   
   const addToCart =async(product:Product,size:string)=>{
    
   }

   const removeFromCart =async(productId:string)=>{

   }

   const updateQuantity =async(productId:string,quantity:number,size:string='M')=>{

   }

   const clearCart =async()=>{

   }
   const itemCount =cartItems.reduce((sum,item)=>sum +item.quantity,0);//here its return the sum of count of items into that cart

   useEffect(()=>{
      fetchCart();//here we call that when the ui render on it
   },[])
  return (
    // these are the data that we pass through context into all child component
    <CartContenxt.Provider value={{cartItems,addToCart,removeFromCart,updateQuantity,clearCart,cartTotal,itemCount,isLoading}}>
        {children}
    </CartContenxt.Provider>
  )
}

export function useCart(){

    const context =useContext(CartContenxt)

    if(context===undefined){
        throw new Error('useCart must be used within a cartContextProduct..')
    }

    return context
}