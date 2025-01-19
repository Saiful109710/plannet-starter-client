import React from 'react'
import useRole from '../hooks/useRole'
import LoadingSpinner from '../components/Shared/LoadingSpinner'
import { Navigate } from 'react-router-dom'

const SellerRoute = ({children}) => {
    const [role,isLoading] = useRole()

    if(isLoading) return <LoadingSpinner></LoadingSpinner>
    if(role==='seller') return children
    return <Navigate to='/dashboard'></Navigate>
}

export default SellerRoute
