'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('analytics')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [categories, setCategories] = useState([])
  const [newCat, setNewCat] = useState('')
  const [newProduct, setNewProduct] = useState({ name: '', price: '', sale_price: '', stock: '', image: '', description: '', category_id: '' })

  const ADMIN_PASSWORD = "admin123" // Yahan apna Admin Password set kar sakte hain

  useEffect(() => {
    if (authenticated) {
      loadData()
    }
  }, [authenticated])

  async function loadData() {
    const { data: pData } = await supabase.from('products').select('*')
    const { data: oData } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    const { data: cData } = await supabase.from('categories').select('*')
    if (pData) setProducts(pData)
    if (oData) setOrders(oData)
    if (cData) setCategories(cData)
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

  const handleAddProduct = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('products').insert([{
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      sale_price: newProduct.sale_price ? parseFloat(newProduct.sale_price) : null,
      stock: parseInt(newProduct.stock),
      images: [newProduct.image],
      description: newProduct.description,
      category_id: newProduct.category_id ? parseInt(newProduct.category_id) : null
    }])
    if (!error) {
      alert('Product Added!')
      setNewProduct({ name: '', price: '', sale_price: '', stock: '', image: '', description: '', category_id: '' })
      loadData()
    } else {
      alert(error.message)
    }
  }

  const updateOrderStatus = async (id, status) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    loadData()
  }

  const totalSales = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0)
  const pendingOrders = orders.filter(o => o.status === 'Pending').length
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length

  if (!authenticated) {
    return (
      <div style={{ padding: '50px 20px', maxWidth: '380px', margin: '0 auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#8B5E3C' }}>🔐 Store Admin</h2>
        <input 
          type="password" 
          placeholder="Enter Admin Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ width: '100%', padding: '12px', margin: '15px 0', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
        <button 
          onClick={() => password === ADMIN_PASSWORD ? setAuthenticated(true) : alert('Incorrect Password')} 
          style={{ width: '100%', padding: '12px', background: '#8B5E3C', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
        >
          Access Dashboard
        </button>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#FAF7F2', minHeight: '100vh', padding: '15px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '10px' }}>
        <h2 style={{ color: '#8B5E3C', margin: 0, fontSize: '18px' }}>🧶 Crochet Admin Panel</h2>
        <button onClick={() => setAuthenticated(false)} style={{ background: '#eee', border: 'none', padding: '6px 12px', borderRadius: '6px' }}>Logout</button>
      </header>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        {['analytics', 'products', 'categories', 'orders'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            style={{ 
              background: activeTab === tab ? '#8B5E3C' : '#fff', 
              color: activeTab === tab ? '#fff' : '#4A3B32', 
              padding: '10px 15px', 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              textTransform: 'capitalize' 
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '10px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Total Revenue</span>
            <h3 style={{ margin: '5px 0 0', color: '#8B5E3C' }}>Rs. {totalSales}</h3>
          </div>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '10px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Total Orders</span>
            <h3 style={{ margin: '5px 0 0', color: '#8B5E3C' }}>{orders.length}</h3>
          </div>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '10px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Pending Orders</span>
            <h3 style={{ margin: '5px 0 0', color: '#d97706' }}>{pendingOrders}</h3>
          </div>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '10px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Delivered</span>
            <h3 style={{ margin: '5px 0 0', color: '#16a34a' }}>{deliveredOrders}</h3>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div style={{ background: '#fff', padding: '15px', borderRadius: '10px' }}>
          <h3>Add Category</h3>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="Category Name" value={newCat} onChange={e => setNewCat(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <button type="submit" style={{ background: '#8B5E3C', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px' }}>Save</button>
          </form>
          <ul style={{ marginTop: '15px', paddingLeft: '20px' }}>
            {categories.map(c => <li key={c.id}>{c.name}</li>)}
          </ul>
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <form onSubmit={handleAddProduct} style={{ background: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
            <h3>Add New Product</h3>
            <input type="text" placeholder="Product Name" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" placeholder="Price (PKR)" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} style={{ flex: 1, padding: '10px', margin: '5px 0' }} />
              <input type="number" placeholder="Sale Price" value={newProduct.sale_price} onChange={e => setNewProduct({...newProduct, sale_price: e.target.value})} style={{ flex: 1, padding: '10px', margin: '5px 0' }} />
            </div>
            <input type="number" placeholder="Stock Quantity" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', boxSizing: 'border-box' }} />
            <select value={newProduct.category_id} onChange={e => setNewProduct({...newProduct, category_id: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0' }}>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="text" placeholder="Image URL" required value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', boxSizing: 'border-box' }} />
            <textarea placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} style={{ width: '100%', padding: '10px', margin: '5px 0', boxSizing: 'border-box' }} />
            <button type="submit" style={{ background: '#8B5E3C', color: '#fff', padding: '12px', border: 'none', width: '100%', borderRadius: '6px', fontWeight: 'bold', marginTop: '10px' }}>Add Product</button>
          </form>

          <h3>Current Products</h3>
          {products.map(p => (
            <div key={p.id} style={{ background: '#fff', padding: '12px', marginBottom: '8px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{p.name}</strong>
                <div style={{ fontSize: '12px', color: '#666' }}>Rs. {p.price} | Stock: {p.stock}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h3>Orders List</h3>
          {orders.map(o => (
            <div key={o.id} style={{ background: '#fff', padding: '15px', marginBottom: '10px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>#{o.tracking_code}</strong>
                <span style={{ color: '#8B5E3C', fontWeight: 'bold' }}>Rs. {o.total}</span>
              </div>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>{o.customer_name} ({o.phone})</p>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#666' }}>{o.address}, {o.city}</p>
              
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => updateOrderStatus(o.id, 'Confirmed')} style={{ fontSize: '12px', padding: '5px' }}>Confirm</button>
                <button onClick={() => updateOrderStatus(o.id, 'Shipped')} style={{ fontSize: '12px', padding: '5px' }}>Ship</button>
                <button onClick={() => updateOrderStatus(o.id, 'Delivered')} style={{ fontSize: '12px', padding: '5px' }}>Deliver</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
