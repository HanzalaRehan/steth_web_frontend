"use client"

import { useState, useEffect } from "react"

const DeliveryForm = ({ data = {}, onDeliveryInfoChange = () => {} }) => {
  const extractDeliveryInfo = () => {
    if (!data || !data.customerInfo || !data.customerInfo.deliveryInfo) {
      return {}
    }
    return data.customerInfo.deliveryInfo
  }

  const [formData, setFormData] = useState({
    address: "",
    city: "",
    ...extractDeliveryInfo()
  })

  const [errors, setErrors] = useState({
    address: "",
    city: "",
  })

  useEffect(() => {
    const deliveryInfo = extractDeliveryInfo()
    if (Object.keys(deliveryInfo).length > 0) {
      setFormData(prev => ({ ...prev, ...deliveryInfo }))
    }
  }, [data])

  const validateField = (field, value) => {
    let error = ""
    switch (field) {
      case 'address':
        if (!value.trim()) error = "Street address is required"
        else if (value.trim().length < 5) error = "Please enter a complete address"
        break
      case 'city':
        if (!value.trim()) error = "City is required"
        else if (value.trim().length < 2) error = "Please enter a valid city name"
        break
    }
    setErrors(prev => ({ ...prev, [field]: error }))
    return !error
  }

  const updateFormData = (field, value) => {
    const updatedData = { ...formData, [field]: value }
    validateField(field, value)
    setFormData(updatedData)
    notifyParent(updatedData)
  }

  const notifyParent = (deliveryData) => {
    onDeliveryInfoChange({
      customerInfo: {
        deliveryInfo: {
          address: deliveryData.address,
          city: deliveryData.city,
        }
      }
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <div className={`border ${errors.address ? 'border-red-500' : 'border-gray-300'} overflow-hidden focus-within:border-gray-500`}>
          <input
            type="text"
            placeholder="Street Address"
            className="w-full px-3 py-3 outline-none bg-white"
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
            onBlur={(e) => validateField('address', e.target.value)}
          />
        </div>
        {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
      </div>

      <div>
        <div className={`border ${errors.city ? 'border-red-500' : 'border-gray-300'} overflow-hidden focus-within:border-gray-500`}>
          <input
            type="text"
            placeholder="City"
            className="w-full px-3 py-3 outline-none bg-white"
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            onBlur={(e) => validateField('city', e.target.value)}
          />
        </div>
        {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
      </div>
    </div>
  )
}

export default DeliveryForm
