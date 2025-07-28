# Multi-Vendor Marketplace Setup

This guide will help you set up a complete multi-vendor marketplace system for SolMart where vendors can register, list products, and manage their business.

## 🏗️ **System Architecture**

### **Core Components:**
1. **Vendor Registration & Management**
2. **Product Management System**
3. **Order Management with Vendor Tracking**
4. **Admin Dashboard for Vendor Approval**
5. **Vendor Dashboard for Business Management**

## 📋 **Prerequisites**

1. **Supabase Project** with environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Database Setup** - Run the SQL scripts in order:
   - `supabase-setup.sql` (Orders table)
   - `supabase-multi-vendor-setup.sql` (Vendors & Products tables)

## 🗄️ **Database Schema**

### **Vendors Table**
```sql
vendors (
  id UUID PRIMARY KEY,
  wallet_address TEXT UNIQUE,
  business_name TEXT,
  description TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  logo TEXT,
  banner TEXT,
  address JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### **Products Table**
```sql
products (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  price DECIMAL,
  category TEXT,
  seller_id UUID REFERENCES vendors(id),
  image TEXT,
  stock_quantity INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### **Orders Table** (Updated)
```sql
orders (
  -- existing fields...
  vendor_orders JSONB DEFAULT '[]'
)
```

## 🚀 **Setup Instructions**

### **1. Database Setup**

1. **Run the SQL scripts in Supabase:**
   ```sql
   -- First run the orders setup
   -- Copy and paste supabase-setup.sql
   
   -- Then run the multi-vendor setup
   -- Copy and paste supabase-multi-vendor-setup.sql
   ```

2. **Verify the tables are created:**
   - Check that `vendors`, `products`, and updated `orders` tables exist
   - Verify RLS policies are enabled
   - Confirm indexes are created for performance

### **2. Environment Configuration**

Ensure your `.env.local` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **3. Application Features**

## 🎯 **Features Implemented**

### **For Vendors:**

#### **1. Vendor Registration** (`/vendor/register`)
- ✅ Complete registration form
- ✅ Business information collection
- ✅ Address and contact details
- ✅ Wallet-based authentication
- ✅ Application status tracking

#### **2. Vendor Dashboard** (`/vendor/dashboard`)
- ✅ Business statistics and analytics
- ✅ Product management overview
- ✅ Order tracking and revenue
- ✅ Status-based access control

#### **3. Product Management** (`/vendor/products`)
- ✅ Add/edit/delete products
- ✅ Product status management (active/inactive)
- ✅ Stock quantity tracking
- ✅ Category organization
- ✅ Search and filter products

### **For Customers:**

#### **1. Product Browsing**
- ✅ View products from all approved vendors
- ✅ Search and filter by category
- ✅ Product details with vendor information

#### **2. Order Management**
- ✅ Multi-vendor order support
- ✅ Vendor-specific order tracking
- ✅ Order history with vendor details

### **For Admins:**

#### **1. Vendor Management**
- ✅ Approve/reject vendor applications
- ✅ Monitor vendor performance
- ✅ Manage vendor status

#### **2. Order Management**
- ✅ View all orders across vendors
- ✅ Update order status
- ✅ Track vendor-specific orders

## 🔄 **Vendor Workflow**

### **1. Registration Process**
```
User → Connect Wallet → Fill Registration Form → Submit Application → Admin Review → Approval/Rejection
```

### **2. Product Management**
```
Approved Vendor → Add Products → Set Pricing → Manage Inventory → Monitor Sales
```

### **3. Order Processing**
```
Customer Order → Vendor Notification → Order Fulfillment → Status Updates → Payment Distribution
```

## 🛡️ **Security Features**

### **Row Level Security (RLS)**
- ✅ Vendors can only manage their own products
- ✅ Customers can only view active products from approved vendors
- ✅ Admins have full access to all data
- ✅ Wallet-based authentication

### **Data Validation**
- ✅ Vendor status validation before product creation
- ✅ Required field validation
- ✅ Price and quantity constraints

## 📊 **Analytics & Reporting**

### **Vendor Analytics**
- ✅ Total products and active products
- ✅ Revenue tracking
- ✅ Order statistics
- ✅ Performance metrics

### **Admin Analytics**
- ✅ Platform-wide statistics
- ✅ Vendor performance comparison
- ✅ Order volume tracking
- ✅ Revenue analytics

## 🔧 **Customization Options**

### **1. Vendor Approval Process**
```sql
-- Customize approval criteria
CREATE POLICY "Custom vendor approval" ON vendors
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin' AND
    -- Add your custom criteria here
  );
```

### **2. Commission Structure**
```sql
-- Add commission tracking
ALTER TABLE orders ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 0.05;
```

### **3. Vendor Categories**
```sql
-- Add vendor categories
ALTER TABLE vendors ADD COLUMN category TEXT;
```

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Vendor can't create products:**
   - Check if vendor status is 'approved'
   - Verify RLS policies are correct
   - Ensure wallet is connected

2. **Products not showing to customers:**
   - Verify vendor is approved
   - Check if product is active
   - Confirm RLS policies allow public viewing

3. **Orders not tracking vendor information:**
   - Check order creation process
   - Verify vendor_id is included in order items
   - Ensure proper data flow

### **Debug Steps:**

1. **Check Supabase Logs:**
   ```sql
   -- View recent errors
   SELECT * FROM auth.logs WHERE created_at > NOW() - INTERVAL '1 hour';
   ```

2. **Verify RLS Policies:**
   ```sql
   -- Check if policies are working
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies WHERE tablename IN ('vendors', 'products', 'orders');
   ```

3. **Test Database Connections:**
   ```javascript
   // Test in browser console
   const { data, error } = await supabase.from('vendors').select('*').limit(1);
   console.log('Connection test:', { data, error });
   ```

## 📈 **Next Steps & Enhancements**

### **Phase 2 Features:**
1. **Advanced Analytics**
   - Sales reports and trends
   - Customer behavior analysis
   - Inventory optimization

2. **Communication System**
   - Vendor-customer messaging
   - Order status notifications
   - Email integration

3. **Payment Processing**
   - Commission calculation
   - Automated payouts
   - Payment dispute handling

4. **Advanced Vendor Features**
   - Bulk product import
   - Advanced inventory management
   - Shipping integration

5. **Customer Features**
   - Vendor reviews and ratings
   - Wishlist functionality
   - Advanced search filters

### **Performance Optimizations:**
1. **Database Indexing**
   - Add composite indexes for complex queries
   - Optimize for common search patterns

2. **Caching Strategy**
   - Implement Redis for session management
   - Cache frequently accessed product data

3. **CDN Integration**
   - Optimize image delivery
   - Reduce load times

## 🎉 **Success Metrics**

### **Key Performance Indicators:**
- ✅ Vendor registration completion rate
- ✅ Product listing success rate
- ✅ Order fulfillment time
- ✅ Customer satisfaction scores
- ✅ Platform revenue growth

### **Monitoring Dashboard:**
- Real-time vendor activity
- Order volume tracking
- Revenue analytics
- System performance metrics

---

## 📞 **Support**

For technical support or questions about the multi-vendor system:

1. **Check the troubleshooting section above**
2. **Review Supabase logs for errors**
3. **Test with a fresh vendor registration**
4. **Verify all environment variables are set**

The multi-vendor system is now ready for production use! 🚀 