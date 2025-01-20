import axios from "axios"

export const imageUpload = async(imageData)=>{

    const formData = new FormData()
     formData.append('image',imageData)

    const {data} = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,formData)
    const image_url = data.data.display_url
    return image_url


}

export const saveUser = async(user)=>{
    await axios.post(`${import.meta.env.VITE_API_URL}/users/${user?.email}`,{
        name:user.displayName,
        image:user.photoURL,
        email:user.email
       
    })
}

export const shortImageName = (image,length=10)=>{
    if(!image?.name || typeof image?.name !== 'string') return 'Chose Image'
    if(image?.name.length<=15) return image?.name
    return image?.name.substring(0,length).concat(`...${image.type.split('/')[1]}`)
}