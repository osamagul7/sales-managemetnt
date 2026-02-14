const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Invoice = require('./models/Invoice');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/salesdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Invoice.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@salesapp.com',
        password: 'admin123',
        role: 'admin',
        status: 'active',
        lastLogin: new Date()
      },
      {
        name: 'Manager User',
        email: 'manager@salesapp.com',
        password: 'manager123',
        role: 'manager',
        status: 'active',
        lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Sales Person',
        email: 'sales@salesapp.com',
        password: 'sales123',
        role: 'salesperson',
        status: 'active',
        lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'John Smith',
        email: 'john.smith@salesapp.com',
        password: 'john123',
        role: 'salesperson',
        status: 'active',
        lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@salesapp.com',
        password: 'sarah123',
        role: 'manager',
        status: 'active',
        lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('👥 Created users');

    // Create customers
    const customers = await Customer.create([
      {
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1 (555) 123-4567',
        address: {
          street: '123 Business Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        company: 'Acme Corporation',
        website: 'www.acme.com',
        creditLimit: 50000,
        status: 'active',
        createdBy: users[0]._id
      },
      {
        name: 'Tech Solutions Inc',
        email: 'info@techsolutions.com',
        phone: '+1 (555) 234-5678',
        address: {
          street: '456 Tech Boulevard',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA'
        },
        company: 'Tech Solutions Inc',
        website: 'www.techsolutions.com',
        creditLimit: 75000,
        status: 'active',
        createdBy: users[1]._id
      },
      {
        name: 'Global Enterprises',
        email: 'sales@globalent.com',
        phone: '+1 (555) 345-6789',
        address: {
          street: '789 Commerce Street',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA'
        },
        company: 'Global Enterprises',
        website: 'www.globalent.com',
        creditLimit: 100000,
        status: 'active',
        createdBy: users[2]._id
      },
      {
        name: 'Innovation Labs',
        email: 'hello@innovationlabs.com',
        phone: '+1 (555) 456-7890',
        address: {
          street: '321 Innovation Drive',
          city: 'Austin',
          state: 'TX',
          zipCode: '73301',
          country: 'USA'
        },
        company: 'Innovation Labs',
        website: 'www.innovationlabs.com',
        creditLimit: 30000,
        status: 'active',
        createdBy: users[0]._id
      },
      {
        name: 'Digital Services Co',
        email: 'contact@digitalservices.com',
        phone: '+1 (555) 567-8901',
        address: {
          street: '654 Digital Way',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
          country: 'USA'
        },
        company: 'Digital Services Co',
        website: 'www.digitalservices.com',
        creditLimit: 60000,
        status: 'active',
        createdBy: users[1]._id
      },
      {
        name: 'StartUp Ventures',
        email: 'info@startupventures.com',
        phone: '+1 (555) 678-9012',
        address: {
          street: '987 Startup Lane',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101',
          country: 'USA'
        },
        company: 'StartUp Ventures',
        website: 'www.startupventures.com',
        creditLimit: 25000,
        status: 'active',
        createdBy: users[2]._id
      },
      {
        name: 'Manufacturing Plus',
        email: 'sales@manufacturingplus.com',
        phone: '+1 (555) 789-0123',
        address: {
          street: '147 Factory Road',
          city: 'Detroit',
          state: 'MI',
          zipCode: '48201',
          country: 'USA'
        },
        company: 'Manufacturing Plus',
        website: 'www.manufacturingplus.com',
        creditLimit: 80000,
        status: 'active',
        createdBy: users[0]._id
      },
      {
        name: 'Retail Giants',
        email: 'contact@retailgiants.com',
        phone: '+1 (555) 890-1234',
        address: {
          street: '258 Retail Plaza',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA'
        },
        company: 'Retail Giants',
        website: 'www.retailgiants.com',
        creditLimit: 120000,
        status: 'active',
        createdBy: users[1]._id
      },
      {
        name: 'Healthcare Systems',
        email: 'info@healthcaresystems.com',
        phone: '+1 (555) 901-2345',
        address: {
          street: '369 Medical Center Drive',
          city: 'Houston',
          state: 'TX',
          zipCode: '77001',
          country: 'USA'
        },
        company: 'Healthcare Systems',
        website: 'www.healthcaresystems.com',
        creditLimit: 90000,
        status: 'active',
        createdBy: users[2]._id
      },
      {
        name: 'Education First',
        email: 'hello@educationfirst.com',
        phone: '+1 (555) 012-3456',
        address: {
          street: '741 Campus Boulevard',
          city: 'Philadelphia',
          state: 'PA',
          zipCode: '19101',
          country: 'USA'
        },
        company: 'Education First',
        website: 'www.educationfirst.com',
        creditLimit: 40000,
        status: 'active',
        createdBy: users[0]._id
      }
    ]);

    console.log('👥 Created customers');

    // Create products
    const products = await Product.create([
      {
        name: 'Laptop Pro 15"',
        description: 'High-performance laptop with 15-inch display, Intel i7 processor, 16GB RAM, 512GB SSD',
        category: 'Electronics',
        price: 1299.99,
        cost: 800.00,
        stock: 50,
        minStockLevel: 10,
        unit: 'pcs',
        sku: 'LAP-PRO-15',
        taxRate: 8.5,
        reorderPoint: 15,
        reorderQuantity: 25,
        status: 'active'
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with precision tracking and long battery life',
        category: 'Electronics',
        price: 29.99,
        cost: 12.50,
        stock: 200,
        minStockLevel: 50,
        unit: 'pcs',
        sku: 'MOU-WIR-001',
        taxRate: 8.5,
        reorderPoint: 75,
        reorderQuantity: 100,
        status: 'active'
      },
      {
        name: 'Office Chair Deluxe',
        description: 'Ergonomic office chair with lumbar support and adjustable height',
        category: 'Furniture',
        price: 399.99,
        cost: 250.00,
        stock: 25,
        minStockLevel: 5,
        unit: 'pcs',
        sku: 'CHA-OFC-DEL',
        taxRate: 8.5,
        reorderPoint: 8,
        reorderQuantity: 15,
        status: 'active'
      },
      {
        name: 'Standing Desk',
        description: 'Adjustable height standing desk with cable management system',
        category: 'Furniture',
        price: 599.99,
        cost: 350.00,
        stock: 15,
        minStockLevel: 3,
        unit: 'pcs',
        sku: 'DES-STN-ADJ',
        taxRate: 8.5,
        reorderPoint: 5,
        reorderQuantity: 10,
        status: 'active'
      },
      {
        name: 'Monitor 27" 4K',
        description: '27-inch 4K UHD monitor with HDR support and 144Hz refresh rate',
        category: 'Electronics',
        price: 449.99,
        cost: 280.00,
        stock: 30,
        minStockLevel: 8,
        unit: 'pcs',
        sku: 'MON-27-4K',
        taxRate: 8.5,
        reorderPoint: 10,
        reorderQuantity: 20,
        status: 'active'
      },
      {
        name: 'Keyboard Mechanical',
        description: 'RGB mechanical keyboard with blue switches and programmable keys',
        category: 'Electronics',
        price: 89.99,
        cost: 45.00,
        stock: 75,
        minStockLevel: 15,
        unit: 'pcs',
        sku: 'KEY-MEC-RGB',
        taxRate: 8.5,
        reorderPoint: 20,
        reorderQuantity: 40,
        status: 'active'
      },
      {
        name: 'Webcam HD 1080p',
        description: 'HD webcam with auto-focus and built-in microphone',
        category: 'Electronics',
        price: 79.99,
        cost: 35.00,
        stock: 60,
        minStockLevel: 12,
        unit: 'pcs',
        sku: 'CAM-HD-108',
        taxRate: 8.5,
        reorderPoint: 18,
        reorderQuantity: 30,
        status: 'active'
      },
      {
        name: 'Printer All-in-One',
        description: 'Wireless all-in-one printer, scanner, copier with WiFi',
        category: 'Electronics',
        price: 199.99,
        cost: 120.00,
        stock: 20,
        minStockLevel: 5,
        unit: 'pcs',
        sku: 'PRI-AIO-WL',
        taxRate: 8.5,
        reorderPoint: 6,
        reorderQuantity: 15,
        status: 'active'
      },
      {
        name: 'Desk Lamp LED',
        description: 'Adjustable LED desk lamp with USB charging port',
        category: 'Furniture',
        price: 39.99,
        cost: 18.00,
        stock: 100,
        minStockLevel: 20,
        unit: 'pcs',
        sku: 'LAM-LED-USB',
        taxRate: 8.5,
        reorderPoint: 25,
        reorderQuantity: 50,
        status: 'active'
      },
      {
        name: 'USB-C Hub',
        description: '7-in-1 USB-C hub with HDMI and SD card reader',
        category: 'Electronics',
        price: 49.99,
        cost: 22.00,
        stock: 85,
        minStockLevel: 17,
        unit: 'pcs',
        sku: 'HUB-USB-7IN1',
        taxRate: 8.5,
        reorderPoint: 20,
        reorderQuantity: 40,
        status: 'active'
      },
      {
        name: 'External SSD 1TB',
        description: 'Portable external SSD 1TB USB-C with fast transfer speeds',
        category: 'Electronics',
        price: 149.99,
        cost: 85.00,
        stock: 40,
        minStockLevel: 8,
        unit: 'pcs',
        sku: 'SSD-EXT-1TB',
        taxRate: 8.5,
        reorderPoint: 12,
        reorderQuantity: 25,
        status: 'active'
      },
      {
        name: 'Headphones Noise-Canceling',
        description: 'Wireless noise-canceling headphones with 30-hour battery life',
        category: 'Electronics',
        price: 249.99,
        cost: 140.00,
        stock: 35,
        minStockLevel: 7,
        unit: 'pcs',
        sku: 'HEA-NOI-WL',
        taxRate: 8.5,
        reorderPoint: 10,
        reorderQuantity: 20,
        status: 'active'
      },
      {
        name: 'File Cabinet 4-Drawer',
        description: 'Metal filing cabinet with 4 drawers and lock system',
        category: 'Furniture',
        price: 189.99,
        cost: 110.00,
        stock: 12,
        minStockLevel: 3,
        unit: 'pcs',
        sku: 'CAB-FIL-4DR',
        taxRate: 8.5,
        reorderPoint: 4,
        reorderQuantity: 8,
        status: 'active'
      },
      {
        name: 'Whiteboard Magnetic',
        description: '4ft x 3ft magnetic whiteboard with marker tray',
        category: 'Furniture',
        price: 119.99,
        cost: 65.00,
        stock: 18,
        minStockLevel: 4,
        unit: 'pcs',
        sku: 'WHB-MAG-4X3',
        taxRate: 8.5,
        reorderPoint: 6,
        reorderQuantity: 12,
        status: 'active'
      },
      {
        name: 'Tablet Stand Adjustable',
        description: 'Adjustable tablet and phone stand with multiple viewing angles',
        category: 'Electronics',
        price: 24.99,
        cost: 10.00,
        stock: 120,
        minStockLevel: 24,
        unit: 'pcs',
        sku: 'STD-TAB-ADJ',
        taxRate: 8.5,
        reorderPoint: 30,
        reorderQuantity: 60,
        status: 'active'
      }
    ]);

    console.log('📦 Created products');

    // Create orders
    const orders = [];
    const orderStatuses = ['Pending', 'Processing', 'Completed', 'Completed'];
    const paymentStatuses = ['Paid', 'Paid', 'Partial', 'Unpaid'];
    const paymentMethods = ['Cash', 'Card', 'Bank Transfer', 'Check', 'Other'];
    
    for (let i = 0; i < 15; i++) {
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items per order
      
      const orderItems = [];
      let subTotal = 0;
      
      for (let j = 0; j < numItems; j++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 units
        const unitPrice = randomProduct.price;
        const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 15) : 0; // 0-15% discount
        const tax = 8.5;
        
        const itemTotal = unitPrice * quantity;
        const discountAmount = itemTotal * discount / 100;
        const taxAmount = (itemTotal - discountAmount) * tax / 100;
        const finalItemTotal = itemTotal - discountAmount + taxAmount;
        
        orderItems.push({
          product: randomProduct._id,
          quantity,
          unitPrice,
          discount,
          tax,
          totalPrice: finalItemTotal
        });
        
        subTotal += finalItemTotal;
      }
      
      const orderDiscount = Math.random() > 0.8 ? Math.floor(Math.random() * 10) : 0; // 0-10% order discount
      const discountAmount = subTotal * orderDiscount / 100;
      const tax = (subTotal - discountAmount) * 8.5 / 100;
      const shipping = Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 10 : 0; // $0 or $10-60
      const grandTotal = subTotal - discountAmount + tax + shipping;
      
      const order = await Order.create({
        orderNumber: await Order.generateOrderNumber(),
        customer: randomCustomer._id,
        items: orderItems,
        subTotal,
        discount: discountAmount,
        tax,
        shipping,
        grandTotal,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        paidAmount: Math.random() > 0.3 ? grandTotal : grandTotal * (Math.random() * 0.8),
        notes: `Order note ${i + 1} - ${randomCustomer.name}`,
        createdBy: randomUser._id,
        orderDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date within last 30 days
      });
      
      orders.push(order);
    }

    console.log('📋 Created orders');

    // Create invoices
    const invoices = [];
    const invoiceStatuses = ['Draft', 'Sent', 'Paid', 'Overdue'];
    
    for (let i = 0; i < 15; i++) {
      const completedOrders = orders.filter(order => order.status === 'Completed');
      if (completedOrders.length === 0) break;
      
      const randomOrder = completedOrders[Math.floor(Math.random() * completedOrders.length)];
      if (!randomOrder) continue;
      
      // Get customer data for this invoice
      const customerData = customers.find(c => c._id.toString() === randomOrder.customer.toString());
      if (!customerData) continue;
      
      const issueDate = new Date(randomOrder.orderDate);
      const dueDate = new Date(issueDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days after issue
      
      const invoice = await Invoice.create({
        invoiceNumber: await Invoice.generateInvoiceNumber(),
        order: randomOrder._id,
        customer: randomOrder.customer,
        issueDate,
        dueDate,
        subTotal: randomOrder.subTotal,
        totalAmount: randomOrder.grandTotal,
        paidAmount: Math.random() > 0.4 ? randomOrder.grandTotal : randomOrder.grandTotal * (Math.random() * 0.9),
        balanceDue: randomOrder.grandTotal - (Math.random() > 0.4 ? randomOrder.grandTotal : randomOrder.grandTotal * (Math.random() * 0.9)),
        status: invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)],
        notes: `Invoice for order ${randomOrder.orderNumber}`,
        createdBy: randomOrder.createdBy
      });
      
      invoices.push(invoice);
    }

    console.log('🧾 Created invoices');

    // Update product stock based on orders
    for (const order of orders) {
      if (order.status !== 'Cancelled') {
        for (const item of order.items) {
          await Product.updateStock(item.product, item.quantity, 'subtract');
        }
      }
    }

    console.log('📊 Updated product stock');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n👤 Login Credentials:');
    console.log('Admin: admin@salesapp.com / admin123');
    console.log('Manager: manager@salesapp.com / manager123');
    console.log('Sales: sales@salesapp.com / sales123');
    console.log('John: john.smith@salesapp.com / john123');
    console.log('Sarah: sarah.johnson@salesapp.com / sarah123');
    
    console.log('\n📊 Summary:');
    console.log(`Users: ${users.length}`);
    console.log(`Customers: ${customers.length}`);
    console.log(`Products: ${products.length}`);
    console.log(`Orders: ${orders.length}`);
    console.log(`Invoices: ${invoices.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();
