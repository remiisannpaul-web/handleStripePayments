"use client"

import { useRouter } from "next/navigation"


export default function Page() {
   const router = useRouter()
   
   
   
    return(<button className="p-4 rounded bg-green-300 " onClick={() => router.push('shop')} type="button">Go to shop</button>)
        
}