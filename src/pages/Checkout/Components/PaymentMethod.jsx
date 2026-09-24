"use client"

import { useState, useRef, useEffect } from "react"
import { Upload } from "lucide-react"
import { gsap } from "gsap"

const PaymentMethod = ({ data = {}, onChange }) => {
  const [selectedMethod, setSelectedMethod] = useState(data?.method || "")
  const methodDetailsRef = useRef(null)
  const [formData, setFormData] = useState({
    method: selectedMethod,
    bankTransfer: {
      receipt: data?.bankTransfer?.receipt || null,
    },
    cashOnDelivery: {
      agreedToTerms: data?.cashOnDelivery?.agreedToTerms || false,
    },
    ...data
  })
  
  // For debugging - remove in production
  useEffect(() => {
    console.log("Receipt file:", formData.bankTransfer?.receipt);
  }, [formData.bankTransfer?.receipt]);

  // Handle local storage
  useEffect(() => {
    // Load saved data from localStorage if available
    const savedPaymentData = localStorage.getItem('paymentData')
    if (savedPaymentData) {
      try {
        const parsedData = JSON.parse(savedPaymentData)
        setFormData(prevData => ({
          ...prevData,
          ...parsedData,
          method: parsedData.method || selectedMethod
        }))
        setSelectedMethod(parsedData.method || selectedMethod)
      } catch (e) {
        console.error("Error parsing saved payment data:", e)
      }
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    // Only save if we have some valid data
    if (formData.method) {
      const dataToSave = { ...formData }
      
      // Handle receipt separately
      if (dataToSave.bankTransfer?.receipt instanceof File) {
        dataToSave.bankTransfer.receiptName = dataToSave.bankTransfer.receipt.name
        delete dataToSave.bankTransfer.receipt
      }
      
      localStorage.setItem('paymentData', JSON.stringify(dataToSave))
    }
  }, [formData])

  const handleMethodChange = (method) => {
    if (method === selectedMethod) return

    // Animate out current content if exists
    if (methodDetailsRef.current) {
      gsap.to(methodDetailsRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.2,
        onComplete: () => {
          setSelectedMethod(method)
          const updatedData = {
            ...formData,
            method
          }
          setFormData(updatedData)
          
          // Only call onChange if it's a function
          if (typeof onChange === 'function') {
            onChange(updatedData)
          }
          
          // Animate in new content
          setTimeout(() => {
            if (methodDetailsRef.current) {
              gsap.fromTo(methodDetailsRef.current, 
                { opacity: 0, y: 10 }, 
                { opacity: 1, y: 0, duration: 0.3 }
              )
            }
          }, 50)
        },
      })
    } else {
      setSelectedMethod(method)
      const updatedData = {
        ...formData,
        method
      }
      setFormData(updatedData)
      
      // Only call onChange if it's a function
      if (typeof onChange === 'function') {
        onChange(updatedData)
      }
    }
  }

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type and size
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload an image (PNG, JPG) or PDF file')
      return
    }
    
    if (file.size > maxSize) {
      alert('File size exceeds 5MB limit')
      return
    }
    
    // Update the form data with the new file
    const updatedData = {
      ...formData,
      bankTransfer: {
        ...formData.bankTransfer,
        receipt: file
      }
    }
    
    setFormData(updatedData)
    
    // Only call onChange if it's a function
    if (typeof onChange === 'function') {
      onChange(updatedData)
    }

    // Force re-render to show file name
    console.log(`File "${file.name}" has been added!`);
  }

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Check file type and size
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      if (!validTypes.includes(file.type)) {
        alert('Please upload an image (PNG, JPG) or PDF file')
        return
      }
      
      if (file.size > maxSize) {
        alert('File size exceeds 5MB limit')
        return
      }
      
      // Update form data with new file
      const updatedData = {
        ...formData,
        bankTransfer: {
          ...formData.bankTransfer,
          receipt: file
        }
      }
      
      setFormData(updatedData)
      
      // Only call onChange if it's a function
      if (typeof onChange === 'function') {
        onChange(updatedData)
      }
      
      // Force re-render to show file name
      console.log(`File "${file.name}" has been added via drag and drop!`);
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCashOnDeliveryTerms = (checked) => {
    const updatedData = {
      ...formData,
      cashOnDelivery: {
        ...formData.cashOnDelivery,
        agreedToTerms: checked
      }
    }
    
    setFormData(updatedData)
    
    // Only call onChange if it's a function
    if (typeof onChange === 'function') {
      onChange(updatedData)
    }
  }

  return (
    <div className="space-y-4 relative z-0">
      {/* Payment Method Selector */}
      <div className="border border-hairline">
        {/* Cash on Delivery Option */}
        <div
          className={`cursor-pointer ${selectedMethod === "cash-on-delivery" ? "bg-paper" : ""}`}
          onClick={() => handleMethodChange("cash-on-delivery")}
        >
          <div className="flex items-center px-3 py-3">
            <div className="w-5 h-5 rounded-full border border-hairline flex items-center justify-center mr-2">
              {selectedMethod === "cash-on-delivery" && <div className="w-3 h-3 bg-navy rounded-full"></div>}
            </div>
            <span className="font-archivo font-semibold uppercase tracking-[0.1em] text-sm text-navy">Cash on Delivery</span>
          </div>

          {/* Cash on Delivery Details - Only shown when selected */}
          {selectedMethod === "cash-on-delivery" && (
            <div ref={methodDetailsRef} className="border-t border-hairline">
              <div className="p-4">
                <p className="text-sm mb-3 font-spectral text-ink">You'll pay when your order is delivered to your doorstep.</p>
                <div className="bg-paper p-3 border border-hairline mb-3">
                  <p className="text-sm font-spectral text-flannel/80">
                    • The delivery person will accept cash payment
                  </p>
                  <p className="text-sm font-spectral text-flannel/80">
                    • Please have the exact amount ready
                  </p>
                  <p className="text-sm font-spectral text-flannel/80">
                    • A receipt will be provided upon delivery
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bank Transfer Option */}
        <div
          className={`border-t border-hairline cursor-pointer ${selectedMethod === "bank-transfer" ? "bg-paper" : ""}`}
          onClick={() => handleMethodChange("bank-transfer")}
        >
          <div className="flex items-center px-3 py-3">
            <div className="w-5 h-5 rounded-full border border-hairline flex items-center justify-center mr-2">
              {selectedMethod === "bank-transfer" && <div className="w-3 h-3 bg-navy rounded-full"></div>}
            </div>
            <span className="font-archivo font-semibold uppercase tracking-[0.1em] text-sm text-navy">Bank Transfer</span>
          </div>

          {/* Bank Transfer Details - Only shown when selected */}
          {selectedMethod === "bank-transfer" && (
            <div ref={methodDetailsRef} className="border-t border-hairline">
              <div className="p-4">
                <p className="text-sm mb-2 font-spectral text-ink">Send payment to any of our bank accounts:</p>
                <div className="bg-paper p-3 border border-hairline mb-3">
                  <div>
                    <p className="font-archivo font-semibold text-sm text-navy">Meezan Bank</p>
                    <p className="text-sm font-spectral text-flannel/80">Account Number: 03080102452328</p>
                    <p className="text-sm font-spectral text-flannel/80">IBAN: PK33MEZN0003080102452328</p>
                    <p className="text-sm font-spectral text-flannel/80">Account Title: ALI HUZAIFA BIN REHAN</p>
                  </div>
                </div>
                <p className="text-sm mb-3 font-spectral text-ink">Please upload a screenshot of your payment receipt:</p>

                {/* Simplified upload area with clear visual feedback */}
                <div
                  className="border-2 border-dashed border-hairline p-4 text-center"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {/* File Input */}
                  <input
                    type="file"
                    id="receipt-upload"
                    onChange={handleReceiptUpload}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                  />

                  {/* Upload Icon */}
                  <Upload className="mx-auto h-8 w-8 text-flannel/50 mb-2" strokeWidth={1.5} />

                  {/* File Status Display */}
                  {formData.bankTransfer?.receipt ? (
                    <div className="bg-paper p-2 mb-2 text-green-700 border border-green-200">
                      <p className="font-archivo font-semibold text-sm">File uploaded successfully!</p>
                      <p className="text-sm font-spectral">
                        {formData.bankTransfer.receipt.name ||
                         (formData.bankTransfer.receiptName ? formData.bankTransfer.receiptName : "Receipt")}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-spectral text-flannel/70">Click to upload or drag and drop</p>
                      <p className="text-xs font-spectral text-flannel/50 mt-1">PNG, JPG or PDF (max. 5MB)</p>
                    </>
                  )}

                  {/* Upload Button */}
                  <label
                    htmlFor="receipt-upload"
                    className="mt-3 inline-block bg-navy text-paper font-archivo font-semibold uppercase tracking-[0.12em] text-xs px-4 py-2.5 cursor-pointer hover:bg-ink transition-colors"
                  >
                    {formData.bankTransfer?.receipt ? 'Change Receipt' : 'Upload Receipt'}
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentMethod