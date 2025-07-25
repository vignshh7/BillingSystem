# 🛒 Point of Sale (POS) System

A modern, responsive web-based Point of Sale system designed for restaurants and retail businesses. Built with HTML, CSS, and JavaScript, this system provides a complete solution for order management, billing, sales reporting, and inventory tracking.

![POS System Preview](https://img.shields.io/badge/Status-Active-green) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

## ✨ Features

### 🍽️ Menu Management
- **Dynamic Menu Display**: Load menu items from `data.json` with images and pricing
- **Visual Interface**: Clean, intuitive menu layout with item images
- **Quick Selection**: Click-to-add functionality for fast order processing

### 📋 Order Management
- **Add Items**: Multiple ways to add items (click menu items or manual entry)
- **Quantity Control**: Specify quantities and prices for each item
- **Order Modification**: Cancel individual items or clear entire transactions
- **Real-time Updates**: Live order totals and item counts

### 💰 Billing System
- **Automatic GST Calculation**: Built-in 18% GST calculation
- **Tender Management**: Calculate change automatically
- **Bill Generation**: Professional bill formatting
- **Transaction Saving**: Persistent transaction history

### 📊 Sales Reporting
- **Time-based Filtering**: View sales for today, custom date ranges
- **Sales Analytics**: Track revenue and transaction patterns
- **Historical Data**: Access to past sales records
- **Export Capabilities**: Generate reports for business analysis

### 📦 Inventory Tracking
- **Stock Monitoring**: Track purchased, sold, and in-stock quantities
- **Date Filtering**: Filter inventory by specific time periods
- **Low Stock Alerts**: Monitor inventory levels
- **Purchase History**: Complete audit trail of stock movements

### 📱 Responsive Design
- **Multi-device Support**: Works seamlessly on desktop, tablet, and mobile
- **Touch-friendly Interface**: Optimized for touch interactions
- **Adaptive Layout**: Automatically adjusts to different screen sizes

## 🚀 Getting Started

### Prerequisites
- Web browser with JavaScript enabled
- Local web server (for proper file loading)
- Basic understanding of web technologies

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vignshh7/BillingSystem.git
   cd BillingSystem
   ```

2. **Set up a local server**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (with http-server)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### File Structure
```
BillingSystem/
├── index.html          # Main application file
├── data.json          # Menu items and pricing data
├── styles.css         # Application styling
├── script.js          # Core JavaScript functionality
├── images/            # Menu item images
│   ├── coffee_black.png
│   ├── tea_green.png
│   └── ...
└── README.md          # This file
```

## 🎯 Usage Guide

### Adding Items to Order
1. **Method 1**: Click on menu items directly
2. **Method 2**: Enter item number, quantity, and price manually
3. Click the **Add** button to confirm

### Managing Orders
- **Cancel Item**: Remove the last added item from the order
- **Delete All Transaction**: Clear the entire current order
- **Modify Quantities**: Adjust item quantities before billing

### Processing Bills
1. Click **▶ Bill** to calculate the total with GST
2. Enter the tender amount received from customer
3. System automatically calculates change due
4. Click **Save** to store the transaction

### Viewing Sales Reports
1. Navigate to the **Sales Report** section
2. Select time period:
   - **Today**: Current day sales
   - **Custom**: Specify date range
3. View filtered results with totals

### Inventory Management
1. Access the **Inventory** section
2. Use date filters to view stock movements
3. Monitor current stock levels
4. Track purchase and sales history

### Starting New Orders
- Click **Main Menu** or **New Bill** to reset and start fresh
- All current order data will be cleared

## ⚙️ Configuration

### Menu Items Setup
Edit `data.json` to customize your menu:
```json
{
  "menuItems": [
    {
      "id": 1,
      "name": "Coffee Black",
      "price": 50,
      "image": "coffee_black.png",
      "category": "beverages"
    }
  ]
}
```

### Image Assets
- Place item images in the `images/` folder
- Use PNG format for best quality
- Name files to match the `image` field in `data.json`
- Recommended size: 200x200 pixels

## 🔧 Technical Details

### Data Storage
- **localStorage**: All data persists across browser sessions
- **No Backend Required**: Fully client-side application
- **JSON Format**: Structured data storage for easy management

### Browser Compatibility
- Modern browsers with ES6+ support
- Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- Mobile browsers supported

### Dependencies
- **jQuery**: For DOM manipulation and AJAX requests
- **No additional frameworks required**

## ⚠️ Important Notes

### Development Considerations
- **Date Testing**: Currently uses hardcoded date (2025-06-10) for testing
- **Production Setup**: Change to `new Date()` for real-time dates
- **Local Server**: Required for proper file loading due to CORS restrictions

### Limitations
- **No Backend Database**: Data stored locally in browser
- **Single User**: Not designed for multi-user environments
- **Limited Scalability**: localStorage has size limitations

## 🔮 Future Enhancements

### Planned Features
- [ ] **Backend Integration**: Database connectivity for persistent storage
- [ ] **Print Functionality**: Direct bill printing capabilities
- [ ] **Multi-language Support**: Internationalization features
- [ ] **User Authentication**: Multi-user support with role management
- [ ] **Advanced Analytics**: Detailed sales and inventory analytics
- [ ] **Cloud Sync**: Data synchronization across devices
- [ ] **Receipt Templates**: Customizable bill formats
- [ ] **Barcode Support**: Barcode scanning for quick item entry

### Performance Improvements
- [ ] **Image Optimization**: Lazy loading and compression
- [ ] **Error Handling**: Enhanced error management and user feedback
- [ ] **Offline Support**: Service worker for offline functionality
- [ ] **Data Export**: CSV/PDF export capabilities



## 📄 License

This project is unlicensed and available for educational and personal use. Feel free to modify and distribute as needed.

## 👨‍💻 Author

**Vignesh** - [@vignshh7](https://github.com/vignshh7)


---

⭐ **Star this repository if you find it helpful!**

*Built with ❤️ for small businesses and educational purposes*
