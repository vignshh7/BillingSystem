# 🛒 Point of Sale (POS) System

A modern, responsive web-based POS system for restaurants and retail businesses. Built with HTML, CSS, and JavaScript for complete order management, billing, and inventory tracking.

![POS System Preview](https://img.shields.io/badge/Status-Active-green) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

## ✨ Features

- **Menu Management**: Dynamic menu display with images and pricing
- **Order Processing**: Click-to-add items with quantity control
- **Billing System**: Automatic GST calculation and change management
- **Sales Reporting**: Time-based filtering and analytics
- **Inventory Tracking**: Stock monitoring with purchase history
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/vignshh7/BillingSystem.git
cd BillingSystem

# Start local server
python -m http.server 8000

# Open browser
http://localhost:8000
```

## 📁 File Structure

```
BillingSystem/
├── index.html          # Main application
├── data.json          # Menu items data
├── styles.css         # Application styling
├── script.js          # Core functionality
└── images/            # Menu item images
```

## 🎯 Usage

1. **Add Items**: Click menu items or enter manually
2. **Process Bills**: Click ▶ Bill → Enter tender → Save
3. **View Reports**: Navigate to Sales Report section
4. **Manage Inventory**: Access Inventory section for stock tracking

## 🔧 Configuration

Edit `data.json` for menu customization:
```json
{
  "menuItems": [
    {
      "id": 1,
      "name": "Coffee Black",
      "price": 50,
      "image": "coffee_black.png"
    }
  ]
}
```

## 📄 License

This project is unlicensed and available for educational and personal use.

## 👨‍💻 Author

**Vignesh** - [@vignshh7](https://github.com/vignshh7)

---

⭐ **Star this repository if you find it helpful!**
