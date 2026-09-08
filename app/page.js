'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function CrochetStore() {
  const [view, setView] = useState('store') // 'store', 'cart', 'admin'
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  // Admin State
  const [adminAuth, setAdminAuth] = useState(false)
  const [adminPass, setAdminPass] = useState('')
  const [adminTab, setAdminTab] = useState('products')
  const [orders, setOrders] = useState([])
  const [newCat, setNewCat] = useState('')
  const [newProd, setNewProd] = useState({ name: '', price: '', stock: '', image: '', description: '', category_id: '' })

  // Checkout State
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', city: '' })
  const [orderPlaced, setOrderPlaced] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    if (!supabase) return
    const { data: pData } = await supabase.from('products').select('*')
    const { data: cData } = await supabase.from('categories').select('*')
    const { data: oData } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (pData) setProducts(pData)
    if (cData) setCategories(cData)
    if (oData) setOrders(oData)
  }

  const addToCart = (product) => {
    setCart(prev => {
      const exist = prev.find(item => item.id === product.id)
      if (exist) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      }
      return [...prev, { ...product, qty: 1 }]
    })
    alert('Added to Cart!')
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (cart.length === 0) return alert('Cart is empty!')
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
    const tracking_code = 'CR-' + Math.floor(100000 + Math.random() * 900000)

    const { error } = await supabase.from('orders').insert([{
      customer_name: customer.name,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      total: total,
      items: cart,
      status: 'Pending',
      tracking_code: tracking_code
    }])

    if (!error) {
      setOrderPlaced(tracking_code)
      setCart([])
    } else {
      alert(error.message)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('products').insert([{
      name: newProd.name,
      price: parseFloat(newProd.price),
      stock: parseInt(newProd.stock),
      images: [newProd.image],
      description: newProd.description,
      category_id: newProd.category_id ? parseInt(newProd.category_id) : null
    }])
    if (!error) {
      alert('Product Added!')
      setNewProd({ name: '', price: '', stock: '', image: '', description: '', category_id: '' })
      loadData()
    } else {
      alert(error.message)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCat) return
    const { error } = await supabase.from('categories').insert([{ name: newCat }])
    if (!error) {
      alert('Category Added!')
      setNewCat('')
      loadData()
    }
  }

  const updateOrderStatus = async (id, status) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    loadData()
  }

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category_id === categories.find(c => c.name === selectedCategory)?.id)

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#FAF7F2', minHeight: '100vh', paddingBottom: '40px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: '#fff', borderBottom: '1px solid #eee' }}>
        <h1 style={{ color: '#8B5E3C', fontSize: '20px', margin: 0 }}>🧶 Crochet Boutique</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setView('store')} style={{ background: view === 'store' ? '#8B5E3C' : '#eee', color: view === 'store' ? '#fff' : '#333', border: 'none', padding: '8px 12px', borderRadius: '6px' }}>Shop</button>
          <button onClick={() => setView('cart')} style={{ background: view === 'cart' ? '#8B5E3C' : '#eee', color: view === 'cart' ? '#fff' : '#333', border: 'none', padding: '8px 12px', borderRadius: '6px' }}>Cart ({cart.length})</button>
          <button onClick={() => setView('admin')} style={{ background: view === 'admin' ? '#8B5E3C' : '#eee', color: view === 'admin' ? '#fff' : '#333', border: 'none', padding: '8px 12px', borderRadius: '6px' }}>Admin</button>
        </div>
      </header>

      {/* STORE VIEW */}
      {view === 'store' && (
        <div style={{ padding: '20px' }}>
          {/* Categories Filter */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '5px' }}>
            <button 
              onClick={() => setSelectedCategory('All')}
              style={{ background: selectedCategory === 'All' ? '#8B5E3C' : '#fff', color: selectedCategory === 'All' ? '#fff' : '#333', border: '1px solid #ddd', padding: '6px 14px', borderRadius: '20px', whiteSpace: 'nowrap' }}
            >
              All
            </button>
            {categories.map(c => (
              <button 
                key={c.id} 
                onClick={() => setSelectedCategory(c.name)}
                style={{ background: selectedCategory === c.name ? '#8B5E3C' : '#fff', color: selectedCategory === c.name ? '#fff' : '#333', border: '1px solid #ddd', padding: '6px 14px', borderRadius: '20px', whiteSpace: 'nowrap' }}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            {filteredProducts.map(p => (
              <div key={p.id} style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                {p.images && p.images[0] && <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />}
                <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', margin: '0 0 5px', color: '#333' }}>{p.name}</h3>
                    <p style={{ fontSize: '13px', color: '#8B5E3C', fontWeight: 'bold', margin: '0 0 10px' }}>Rs. {p.price}</p>
                  </div>
                  <button onClick={() => addToCart(p)} style={{ width: '100%', background: '#8B5E3C', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CART & CHECKOUT VIEW */}
      {view === 'cart' && (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
          <h2>Your Shopping Cart</h2>
          {orderPlaced ? (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
              <h3 style={{ color: '#16a34a' }}>🎉 Order Placed Successfully!</h3>
              <p>Your Tracking Code: <strong>{orderPlaced}</strong></p>
              <button onClick={() => setOrderPlaced(null)} style={{ background: '#8B5E3C', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', marginTop: '10px' }}>Continue Shopping</button>
            </div>
          ) : cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div>
              {cart.map(item => (
                <div key={item.id} style={{ background: '#fff', padding: '10px', marginBottom: '8px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>Rs. {item.price} x {item.qty}</div>
                  </div>
                  <span>Rs. {item.price * item.qty}</span>
                </div>
              ))}
              <h3 style={{ textAlign: 'right' }}>Total: Rs. {cart.reduce((sum, item) => sum + (item.price * item.qty), 0)}</h3>
              
              <form onSubmit={handleCheckout} style={{ background: '#fff', padding: '15px', borderRadius: '10px', marginTop: '15px' }}>
                <h4>Shipping Details</h4>
                <input type="text" placeholder="Full Name" required value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', boxSizing: 'border-box' }} />
                <input type="text" placeholder="Phone Number" required value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', boxSizing: 'border-box' }} />
                <input type="text" placeholder="Delivery Address" required value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', boxSizing: 'border-box' }} />
                <input type="text" placeholder="City" required value={customer.city} onChange={e => setCustomer({...customer, city: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', boxSizing: 'border-box' }} />
                <button type="submit" style={{ width: '100%', background: '#8B5E3C', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', marginTop: '10px' }}>Confirm Order</button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ADMIN VIEW */}
      {view === 'admin' && (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
          {!adminAuth ? (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
              <h2>🔐 Admin Login</h2>
              <input type="password" placeholder="Password (admin123)" value={adminPass} onChange={e => setAdminPass(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', boxSizing: 'border-box' }} />
              <button onClick={() => adminPass === 'admin123' ? setAdminAuth(true) : alert('Wrong Password')} style={{ width: '100%', background: '#8B5E3C', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold' }}>Login</button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button onClick={() => setAdminTab('products')} style={{ background: adminTab === 'products' ? '#8B5E3C' : '#fff', color: adminTab === 'products' ? '#fff' : '#333', border: '1px solid #ddd', padding: '8px 12px', borderRadius: '6px' }}>Products</button>
                <button onClick={() => setAdminTab('categories')} style={{ background: adminTab === 'categories' ? '#8B5E3C' : '#fff', color: adminTab === 'categories' ? '#fff' : '#333', border: '1px solid #ddd', padding: '8px 12px', borderRadius: '6px' }}>Categories</button>
                <button onClick={() => setAdminTab('orders')} style={{ background: adminTab === 'orders' ? '#8B5E3C' : '#fff', color: adminTab === 'orders' ? '#fff' : '#333', border: '1px solid #ddd', padding: '8px 12px', borderRadius: '6px' }}>Orders</button>
              </div>

              {adminTab === 'products' && (
                <form onSubmit={handleAddProduct} style={{ background: '#fff', padding: '15px', borderRadius: '10px' }}>
                  <h3>Add Product</h3>
                  <input type="text" placeholder="Name" required value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} style={{ width: '100%', padding: '8px', margin: '5px 0', boxSizing: 'border-box' }} />
                  <input type="number" placeholder="Price" required value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} style={{ width: '100%', padding: '8px', margin: '5px 0', boxSizing: 'border-box' }} />
                  <input type="number" placeholder="Stock" required value={newProd.stock} onChange={e => setNewProd({...newProd, stock: e.target.value})} style={{ width: '100%', padding: '8px', margin: '5px 0', boxSizing: 'border-box' }} />
                  <input type="text" placeholder="Image URL" required value={newProd.image} onChange={e => setNewProd({...newProd, image: e.target.value})} style={{ width: '100%', padding: '8px', margin: '5px 0', boxSizing: 'border-box' }} />
                  <select value={newProd.category_id} onChange={e => setNewProd({...newProd, category_id: e.target.value})} style={{ width: '100%', padding: '8px', margin: '5px 0' }}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <textarea placeholder="Description" value={newProd.description} onChange={e => setNewProd({...newProd, description: e.target.value})} style={{ width: '100%', padding: '8px', margin: '5px 0', boxSizing: 'border-box' }} />
                  <button type="submit" style={{ width: '100%', background: '#8B5E3C', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold' }}>Save Product</button>
                </form>
              )}

              {adminTab === 'categories' && (
                <form onSubmit={handleAddCategory} style={{ background: '#fff', padding: '15px', borderRadius: '10px' }}>
                  <h3>Add Category</h3>
                  <input type="text" placeholder="Category Name" value={newCat} onChange={e => setNewCat(e.target.value)} style={{ width: '100%', padding: '8px', margin: '5px 0', boxSizing: 'border-box' }} />
                  <button type="submit" style={{ width: '100%', background: '#8B5E3C', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px' }}>Save Category</button>
                </form>
              )}

              {adminTab === 'orders' && (
                <div>
                  <h3>Customer Orders</h3>
                  {orders.map(o => (
                    <div key={o.id} style={{ background: '#fff', padding: '12px', marginBottom: '8px', borderRadius: '8px' }}>
                      <strong>#{o.tracking_code} - {o.customer_name}</strong>
                      <p style={{ margin: '5px 0', fontSize: '13px' }}>{o.phone} | {o.address}, {o.city}</p>
                      <p style={{ margin: '0 0 8px', fontWeight: 'bold', color: '#8B5E3C' }}>Total: Rs. {o.total} ({o.status})</p>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => updateOrderStatus(o.id, 'Confirmed')} style={{ fontSize: '11px', padding: '4px 8px' }}>Confirm</button>
                        <button onClick={() => updateOrderStatus(o.id, 'Shipped')} style={{ fontSize: '11px', padding: '4px 8px' }}>Ship</button>
                        <button onClick={() => updateOrderStatus(o.id, 'Delivered')} style={{ fontSize: '11px', padding: '4px 8px' }}>Deliver</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
