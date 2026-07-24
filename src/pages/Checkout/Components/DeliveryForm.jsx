"use client"

import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../../config/api"

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

  // #20 - "is there a token" here means "is anyone logged in", so this is a
  // no-op for guests. Only shown/used when true.
  const [hasAccount, setHasAccount] = useState(false)
  const [saveAddress, setSaveAddress] = useState(false)

  useEffect(() => {
    const deliveryInfo = extractDeliveryInfo()
    if (Object.keys(deliveryInfo).length > 0) {
      setFormData(prev => ({ ...prev, ...deliveryInfo }))
    }
  }, [data])

  // #20 - prefill from the user's saved default (or most recent) address.
  // Mirrors ContactForm.jsx's existing profile-fetch pattern exactly.
  useEffect(() => {
    const fetchSavedAddress = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) return
      setHasAccount(true)

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) return

        const data = await response.json()
        const addresses = data.user?.addresses || []
        if (addresses.length === 0) return

        const savedAddress = addresses.find(a => a.isDefault) || addresses[addresses.length - 1]
        if (!savedAddress) return

        setFormData(prev => {
          const updated = {
            ...prev,
            address: prev.address || savedAddress.addressLine1 || "",
            city: prev.city || savedAddress.city || ""
          }
          // Prefilling alone doesn't go through updateFormData, so the
          // parent (CheckoutPage's checkoutDetails) needs its own nudge -
          // otherwise a user who submits without touching the visibly
          // prefilled fields would fail validation against empty state.
          notifyParent(updated, saveAddress)
          return updated
        })
      } catch (error) {
        console.error("Error loading saved address:", error)
      }
    }

    fetchSavedAddress()
  }, [])

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
    notifyParent(updatedData, saveAddress)
  }

  const handleSaveAddressToggle = (checked) => {
    setSaveAddress(checked)
    notifyParent(formData, checked)
  }

  const notifyParent = (deliveryData, saveAddressValue) => {
    onDeliveryInfoChange({
      customerInfo: {
        deliveryInfo: {
          address: deliveryData.address,
          city: deliveryData.city,
          saveAddress: saveAddressValue,
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

      {hasAccount && (
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={saveAddress}
            onChange={(e) => handleSaveAddressToggle(e.target.checked)}
            className="w-4 h-4"
          />
          Save this address to my profile
        </label>
      )}
    </div>
  )
}

export default DeliveryForm
