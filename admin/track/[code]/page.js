'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function OrderTracking({ params }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getOrder() {
      const { data } = await supabase.from('orders').select('*').eq('tracking_code', params.code).single()
      if (data) setOrder(data)
      setLoading(false)
    }
    getOrder()
  }, [params.code])

  if (loading) return <p style={{ padding: '20px', textAlign: 'center' }}>Loading Order Status...</p>
  if (!order) return <p style={{ padding: '20px', textAlign: 'center' }}>Order not found.</p>

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2>📦 Order Status</h2>
        <p><strong>Tracking ID:</strong> {order.tracking_code}</p>
        <p><strong>Customer:</strong> {order.customer_name}</p>
        <p><strong>Status:</strong> <span style={{ color: '#8B5E3C', fontWeight: 'bold' }}>{order.status}</span></p>
        <p><strong>Total Amount:</strong> Rs. {order.total}</p>
      </div>
    </div>
  )
}
