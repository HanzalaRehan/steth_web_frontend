import React, { useState, useEffect } from 'react'

const ContactForm = ({ data, onChange }) => {
  const [formData, setFormData] = useState({
    name: data?.name || "",
    email: data?.email || "",
    phoneNumber: data?.phoneNumber || "",
  })

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (token) {
          const response = await fetch('https://steth-backend.onrender.com/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const data = await response.json()
            const updates = {}
            if (data.user && data.user.email) updates.email = data.user.email
            if (data.user && data.user.username) updates.name = data.user.username
            if (Object.keys(updates).length > 0) {
              setFormData(prev => ({ ...prev, ...updates }))
              onChange({ ...formData, ...updates })
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }

    fetchUserProfile()
  }, [])

  const validateField = (field, value) => {
    let error = ""
    switch (field) {
      case 'name':
        if (!value.trim()) error = "Name is required"
        break
      case 'email':
        if (!value.trim()) error = "Email is required"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Please enter a valid email address"
        break
      case 'phoneNumber':
        if (!value.trim()) error = "Phone number is required"
        break
    }
    setErrors(prev => ({ ...prev, [field]: error }))
    return !error
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    onChange({ ...formData, [field]: value })
  }

  const handleBlur = (field, value) => {
    validateField(field, value)
  }

  return (
    <div className="space-y-4">
      <div>
        <div className={`border ${errors.name ? 'border-red-500' : 'border-gray-300'} overflow-hidden focus-within:border-gray-500`}>
          <input
            type="text"
            placeholder="Name"
            className="w-full px-3 py-3 outline-none bg-white"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={(e) => handleBlur('name', e.target.value)}
          />
        </div>
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div>
        <div className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'} overflow-hidden focus-within:border-gray-500`}>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-3 outline-none bg-white"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={(e) => handleBlur('email', e.target.value)}
          />
        </div>
        {errors.email ? (
          <p className="text-xs text-red-500 mt-1">{errors.email}</p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">Enter a valid email</p>
        )}
      </div>

      <div>
        <div className={`border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} overflow-hidden focus-within:border-gray-500`}>
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full px-3 py-3 outline-none bg-white"
            value={formData.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            onBlur={(e) => handleBlur('phoneNumber', e.target.value)}
          />
        </div>
        {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>}
      </div>
    </div>
  )
}

export default ContactForm
