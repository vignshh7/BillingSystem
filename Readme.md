Point of Sale (POS) System
A web-based POS system for managing orders, billing, sales reports, and inventory. Built with HTML, CSS, and JavaScript (jQuery), it uses localStorage for data persistence and supports a responsive interface for restaurant or retail use.
Features

Menu Management: Displays menu items from data.json with images and prices.
Order Management: Add, cancel, or clear items in an order.
Billing: Generates bills with 18% GST, tender, and change calculations.
Sales Report: Filters sales by time period (e.g., today, custom range).
Inventory Tracking: Monitors purchased, sold, and in-stock quantities.
Responsive Design: Adapts to desktop, tablet, and mobile screens.


Usage

Add Items: Click menu items or enter item number, quantity, and price, then click Add.
Manage Orders: Use Cancel Item to remove the last item or Delete All Transaction to clear.
Bill: Click ▶ Bill to calculate total with GST. Enter tender amount and save.
Sales Report: View/filter sales by time period (e.g., Today, Custom).
Inventory: Track stock levels with date filters.
Main Menu/New Bill: Reset to start a new order.

Notes

Data: Stored in localStorage, persists across sessions.
Images: Match data.json names (e.g., coffee_black.png).
Date Filters: Uses hardcoded date (2025-06-10) for testing; update to new Date() for real-time.
Limitations: Requires local server for fetch; no backend database.

Future Enhancements

Backend integration for persistent storage.
Improved error handling for missing images/network issues.
Print functionality for bills.
Multi-language support.

License
Unlicensed, for educational/personal use.
