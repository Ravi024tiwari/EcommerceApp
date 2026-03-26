import { dummyWishlist } from "@/assets/assets";
import { Product, WishlistContextType } from "@/constants/types";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const WishlistContext =createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({children}:{children:ReactNode}){
    const [wishlist, setWishlist] =useState<Product[]>([])
    const [loading,setLoading] =useState(false)

    const fetchWishlist =async()=>{ //here we load the dummy data to load on the wishlist 
        setLoading(true)
        setWishlist(dummyWishlist)
        setLoading(false)
    }

    const toggleWishlist =async(product:Product)=>{
        setWishlist((pre)=>{
            const exits =pre.some((p)=>p._id ===product._id)
            if(exits){
                return pre.filter((p)=>p._id !==product._id)
            }

            return [...pre,product]
        })
    }

    const isInWishlist = (productId:string)=>{
        return wishlist.some((p)=>p._id===productId)
    }

    useEffect(()=>{
        fetchWishlist()
    },[]);//when the screen render only on the first time then its load all the credentials data from the backend

  return (
    // these are the data that we pass through context into all child component
    <WishlistContext.Provider value={{wishlist,loading,isInWishlist,toggleWishlist}}>
        {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist(){
    const context =useContext(WishlistContext)

    if(context===undefined){
        throw new Error('useWishlist must be used within a WishlistProvider..')
    }

    return context
}