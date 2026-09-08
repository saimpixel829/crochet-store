'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCart, setShowCart] = useState(false)
  const [checkoutData, setCheckoutData] = useState({ name: '', phone: '', address: '', city: '' })

  const WHATSAPP_NUMBER = "923000000000" // Apna WhatsApp number yahan badlein

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(false)
    // Supabase table setup na hone tak dummy data
    setProducts([
      { id: 1, name: 'Crochet Flower Bouquet', price: 1500, image: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=400' },
      { id: 2, name: 'Cute Plushie Keychain', price: 850, image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400' },
      { id: 3, name: 'Handmade Crochet Bag', price: 2200, image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400' }
    ])
  }

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item))
    } else {
      setCart([...cart, { ...product, qty: 1 }])
    }
  }

  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta
        return newQty > 0 ? { ...item, qty: newQty } : null
      }
      return item
    }).filter(Boolean))
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
  const delivery = subtotal > 0 ? 150 : 0
  const total = subtotal + delivery

  const handleCheckout = (e) => {
    e.preventDefault()
    if (!cart.length) return alert('Cart is empty!')

    let itemsList = cart.map(i => `${i.name} (x${i.qty}) - Rs. ${i.price * i.qty}`).join('\n')
    let msg = `🛍️ *NEW ORDER*\n\n${itemsList}\n\n*Name:* ${checkoutData.name}\n*Phone:* ${checkoutData.phone}\n*Address:* ${checkoutData.address}, ${checkoutData.city}\n\n*Subtotal:* Rs. ${subtotal}\n*Delivery:* Rs. ${delivery}\n*Total:* Rs. ${total}`

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#FAF7F2', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h1 style={{ margin: 0, fontSize: '20px', color: '#8B5E3C' }}>🧶 Crochet Store</h1>
        <button onClick={() => setShowCart(!showCart)} style={{ background: '#8B5E3C', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
          Cart ({cart.reduce((a, b) => a + b.qty, 0)})
        </button>
      </header>

      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        {!showCart ? (
          <div>
            <h2 style={{ fontSize: '18px', color: '#4A3B32' }}>Featured Products</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {products.map(p => (
                <div key={p.id} style={{ background: '#fff', borderRadius: '12px', padding: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                  <h3 style={{ fontSize: '14px', margin: '10px 0 5px', color: '#333' }}>{p.name}</h3>
                  <p style={{ fontWeight: 'bold', color: '#8B5E3C', margin: '0 0 10px' }}>Rs. {p.price}</p>
                  <button onClick={() => addToCart(p)} style={{ width: '100%', background: '#E8D8C8', color: '#4A3B32', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2>Your Cart</h2>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '10px 0' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{item.name}</h4>
                  <span style={{ fontSize: '12px', color: '#666' }}>Rs. {item.price}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => updateQty(item.id, -1)} style={{ padding: '2px 8px' }}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} style={{ padding: '2px 8px' }}>+</button>
                </div>
              </div>
            ))}
            <div style={{ marginTop: '15px', fontWeight: 'bold' }}>
              <p>Delivery: Rs. {delivery}</p>
              <h3>Total: Rs. {total}</h3>
            </div>

            <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
              <input type="text" placeholder="Full Name" required value={checkoutData.name} onChange={e => setCheckoutData({...checkoutData, name: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="tel" placeholder="Phone Number" required value={checkoutData.phone} onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="Address" required value={checkoutData.address} onChange={e => setCheckoutData({...checkoutData, address: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="City" required value={checkoutData.city} onChange={e => setCheckoutData({...checkoutData, city: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              <button type="submit" style={{ background: '#25D366', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}>
                Order via WhatsApp 💬
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
