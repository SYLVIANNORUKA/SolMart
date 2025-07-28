# Order Management Setup

This guide will help you set up the order management system for SolMart.

## Prerequisites

1. A Supabase project with the following environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database Setup

1. **Create the orders table in Supabase:**
   - Go to your Supabase dashboard
   - Navigate to the SQL Editor
   - Run the SQL script from `supabase-setup.sql`

2. **Verify the table structure:**
   The orders table should have the following columns:
   - `id` (UUID, Primary Key)
   - `user_wallet` (TEXT, Required)
   - `user_email` (TEXT, Optional)
   - `items` (JSONB, Required)
   - `total_amount` (DECIMAL, Required)
   - `status` (TEXT, Required, Default: 'pending')
   - `transaction_signature` (TEXT, Optional)
   - `tracking_number` (TEXT, Optional)
   - `estimated_delivery` (TEXT, Optional)
   - `shipping_address` (JSONB, Optional)
   - `notes` (TEXT, Optional)
   - `created_at` (TIMESTAMP, Auto-generated)
   - `updated_at` (TIMESTAMP, Auto-updated)

## Features Implemented

### 1. Order Creation
- When users complete a payment, orders are automatically stored in Supabase
- Order includes user wallet address, items, total amount, and transaction details
- Orders start with 'pending' status

### 2. User Order History
- Users can view their order history at `/orders`
- Orders are filtered by the connected wallet address
- Search functionality to find specific orders
- Real-time order status updates

### 3. Admin Dashboard
- Access admin panel at `/admin`
- View all orders with filtering and search
- Update order status (pending → processing → shipped → delivered)
- Add tracking numbers and estimated delivery dates
- View order statistics and analytics

### 4. Order Status Management
- **Pending**: Order created, payment confirmed
- **Processing**: Order is being prepared
- **Shipped**: Order has been shipped with tracking
- **Delivered**: Order completed
- **Cancelled**: Order cancelled

## Usage

### For Users
1. Add items to cart
2. Connect wallet and checkout
3. View order history at `/orders`
4. Track order status and delivery

### For Admins
1. Access `/admin` with connected wallet
2. View all orders and statistics
3. Update order status as needed
4. Add tracking information for shipped orders
5. Monitor order flow and customer satisfaction

## Security

- Row Level Security (RLS) enabled on orders table
- Users can only view their own orders
- Admin policies can be customized based on your requirements
- Wallet-based authentication for order access

## Customization

### Adding Admin Role
To restrict admin access to specific wallets, modify the admin policy in Supabase:

```sql
-- Example: Allow specific wallet addresses admin access
CREATE POLICY "Specific admins can manage all orders" ON orders
  FOR ALL USING (
    user_wallet IN ('admin_wallet_1', 'admin_wallet_2')
  );
```

### Adding Email Notifications
You can extend the system to send email notifications when:
- Order is created
- Order status changes
- Order is shipped with tracking

### Adding Shipping Address
The system supports shipping address storage. You can add a form to collect shipping addresses during checkout.

## Troubleshooting

### Common Issues

1. **Orders not appearing**: Check if the wallet is connected and authenticated
2. **Admin access denied**: Verify admin wallet policies in Supabase
3. **Order creation fails**: Check Supabase connection and table permissions
4. **Status updates not working**: Verify RLS policies allow admin operations

### Debug Steps

1. Check browser console for errors
2. Verify Supabase environment variables
3. Test database connection in Supabase dashboard
4. Check RLS policies and permissions

## Next Steps

1. Set up email notifications for order updates
2. Add shipping address collection during checkout
3. Implement order cancellation functionality
4. Add order analytics and reporting
5. Create seller-specific order views
6. Add bulk order operations for admins 