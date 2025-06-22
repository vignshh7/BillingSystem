let menuItemsData = [];
let isMenuLoaded = false;
let isBilled = false; 
let x = 1;
const menuItemsWithDates = [
    {"name": "Coffee Black", "img": "images/coffee_black.png", "unitPrice": 16.50, "quantityPurchased": 45},
    {"name": "Tea Black", "img": "images/tea_black.png", "unitPrice": 4.70, "quantityPurchased": 32},
    {"name": "Chrysanthemum Tea", "img": "images/chrysanthemum_tea.png", "unitPrice": 5.00, "quantityPurchased": 28},
    {"name": "Coffee", "img": "images/coffee.png", "unitPrice": 16.50, "quantityPurchased": 67},
    {"name": "Steamed Bun", "img": "images/steamed_bun.png", "unitPrice": 7.30, "quantityPurchased": 53},
    {"name": "Chinese Tea", "img": "images/chinese_tea.png", "unitPrice": 4.70, "quantityPurchased": 39},
    {"name": "Iced Coffee Black", "img": "images/iced_coffee_black.png", "unitPrice": 13.50, "quantityPurchased": 71},
    {"name": "Iced Tea Black", "img": "images/iced_tea_black.png", "unitPrice": 11.70, "quantityPurchased": 25},
    {"name": "Deep Fry Timsum", "img": "images/deep_fry_timsum.png", "unitPrice": 7.30, "quantityPurchased": 48},
    {"name": "Soya Milk", "img": "images/soya_milk.png", "unitPrice": 16.50, "quantityPurchased": 62},
    {"name": "Iced Coffee", "img": "images/iced_coffee.png", "unitPrice": 13.50, "quantityPurchased": 36},
    {"name": "Iced Tea", "img": "images/iced_tea.png", "unitPrice": 11.70, "quantityPurchased": 29},
    {"name": "Grass Jelly", "img": "images/grass_jelly.png", "unitPrice": 8.00, "quantityPurchased": 55},
    {"name": "Bake", "img": "images/bake.png", "unitPrice": 7.30, "quantityPurchased": 42},
    {"name": "Coffee C", "img": "images/coffee_c.png", "unitPrice": 16.50, "quantityPurchased": 78},
    {"name": "Tea C", "img": "images/tea_c.png", "unitPrice": 4.70, "quantityPurchased": 33},
    {"name": "MILO", "img": "images/milo.png", "unitPrice": 6.50, "quantityPurchased": 51},
    {"name": "Porridge", "img": "images/porridge.png", "unitPrice": 11.20, "quantityPurchased": 64},
    {"name": "Iced MILO", "img": "images/iced_milo.png", "unitPrice": 6.50, "quantityPurchased": 27},
    {"name": "Tea", "img": "images/tea.png", "unitPrice": 4.70, "quantityPurchased": 46},
    {"name": "Chinese Tea_2", "img": "images/chinese_tea_2.png", "unitPrice": 4.70, "quantityPurchased": 38},
    {"name": "Beverage", "img": "images/beverage.png", "unitPrice": 8.00, "quantityPurchased": 59},
    {"name": "Iced Coffee Black_2", "img": "images/iced_coffee_black_2.png", "unitPrice": 13.50, "quantityPurchased": 31},
    {"name": "Iced Tea Black_2", "img": "images/iced_tea_black_2.png", "unitPrice": 11.70, "quantityPurchased": 44},
    {"name": "Soya Milk_2", "img": "images/soya_milk_2.png", "unitPrice": 16.50, "quantityPurchased": 69},
    {"name": "Coffee_2", "img": "images/coffee_2.png", "unitPrice": 16.50, "quantityPurchased": 52},
    {"name": "Fry Timsum", "img": "images/fry_timsum.png", "unitPrice": 7.30, "quantityPurchased": 47},
    {"name": "Dumplings", "img": "images/dumplings.png", "unitPrice": 16.10, "quantityPurchased": 35}
];


const startDateRange = new Date('2016-01-01T00:00:00');
const endDateRange = new Date('2025-06-10T11:52:00');
menuItemsWithDates.forEach(item => {
    const randomDate = new Date(
        startDateRange.getTime() + Math.random() * (endDateRange.getTime() - startDateRange.getTime())
    );
    item.purchaseDate = randomDate.toISOString();
});

document.addEventListener('DOMContentLoaded', () => {
    fetchMenuItems().then(() => {
        loadOrder();
    }).catch(error => {
        console.error('Failed to fetch menu items:', error);
    });
});

$(document).ready(() => {
    bindButtonEvents();
});

function bindButtonEvents() {
    console.log('Binding button events...');

    const cancelBtn = $('#c1');
    if (cancelBtn.length) {
        cancelBtn.off('click').on('click', () => {
            console.log('Cancel Item button clicked');
            let currentOrder = JSON.parse(localStorage.getItem('currentOrder')) || [];
            let itemAdditionHistory = JSON.parse(localStorage.getItem('itemAdditionHistory')) || [];
            if (itemAdditionHistory.length > 0) {
                const lastAddedItemName = itemAdditionHistory.pop();
                console.log(`Last added item: ${lastAddedItemName}`);
                const itemIndex = currentOrder.findIndex(i => i.name === lastAddedItemName);
                if (itemIndex !== -1) {
                    const item = currentOrder[itemIndex];
                    if (item.quantity > 1) {
                        item.quantity -= 1;
                        console.log(`Reduced quantity for ${item.name}: ${item.quantity}`);
                    } else {
                        currentOrder.splice(itemIndex, 1);
                        console.log(`Removed item: ${lastAddedItemName}`);
                    }
                    if (currentOrder.length === 0) {
                        resetTopSection();
                    }
                    saveOrder(currentOrder, itemAdditionHistory);
                    loadOrder();
                } else {
                    console.error(`Item not found in order: ${lastAddedItemName}`);
                }
            } 
        });
    } 

    const deleteAllBtn = $('#d1');
    if (deleteAllBtn.length) {
        deleteAllBtn.off('click').on('click', () => {
            console.log('Delete All Transaction button clicked');
            const currentOrder = [];
            const itemAdditionHistory = [];
            isBilled = false;
            saveOrder(currentOrder, itemAdditionHistory);
            loadOrder();
            resetTopSection();
        });
    } else {
        console.error('Delete All Transaction button (id="d1") not found in DOM');
    }

    const addBtn = $('.add-btn');
    if (addBtn.length) {
        console.log('Add button found, binding event...');
        addBtn.off('click').on('click', () => {
            const itemNumberInput = document.getElementById('item-number');
            const quantityInput = document.getElementById('quantity');
            const unitPriceInput = document.getElementById('itemss');

            if (!itemNumberInput || !quantityInput || !unitPriceInput) {
                console.error('One or more input fields not found in DOM:', {
                    itemNumberInput: !!itemNumberInput,
                    quantityInput: !!quantityInput,
                    unitPriceInput: !!unitPriceInput
                });
                alert('Required input fields are missing. Please contact support.');
                return;
            }

            const itemNumber = itemNumberInput.value;
            const quantity = parseInt(quantityInput.value);
            const unitPrice = parseFloat(unitPriceInput.value);

            if (itemNumber && quantity > 0 && !isNaN(unitPrice) && unitPrice > 0) {
                
                addItem(`Item ${itemNumber}`, quantity, unitPrice);
                itemNumberInput.value = '';
                quantityInput.value = '';
                unitPriceInput.value = '';
            } else {
                alert('Please ensure all fields are filled correctly:\n- Item Number must not be empty.\n- Quantity must be greater than 0.\n- Unit Price must be a positive number.');
            }
        });
    } else {
        console.error('Add button not found in DOM');
    }

    $('.number-btn').off('click').on('click', function () {
        const activeInput = document.querySelector('input:focus');
        if (activeInput) {
            activeInput.value += $(this).text();
            console.log(`Number button clicked: ${$(this).text()}, input value: ${activeInput.value}`);
        }
    });

    const clearBtn = $('.action-btn:contains("Clear")');
    if (clearBtn.length) {
        console.log('Clear button found, binding event...');
        clearBtn.off('click').on('click', () => {
            console.log('Clear button clicked');
            document.querySelectorAll('input').forEach(input => {
                input.value = '';
            });
        });
    } else {
        console.error('Clear button not found in DOM');
    }

    const billBtn = $('.control-btn:contains("▶ Bill")');
    if (billBtn.length) {
        console.log('Bill button found, binding event...');
        billBtn.off('click').on('click', () => {
            console.log('Bill button clicked');
            const currentOrder = JSON.parse(localStorage.getItem('currentOrder')) || [];
            if (currentOrder.length === 0) {
                console.log('No items to bill');
                return;
            }

            const total = currentOrder.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
            const gstRate = 0.18;
            const gstAmount = total * gstRate;
            const payable = total + gstAmount;

            const bill = {
                items: currentOrder,
                total: total,
                gst: gstAmount,
                payable: payable,
                tender: 0,
                change: 0
            };

            isBilled = true;
            displayBill(bill, payable);
        });
    } 

    const newBillBtn = $('.control-btn:contains("New Bill")');
    if (newBillBtn.length) {
        console.log('New Bill button found, binding event...');
        newBillBtn.off('click').on('click', () => {
            console.log('New Bill button clicked');
            const currentOrder = [];
            const itemAdditionHistory = [];
            isBilled = false;
            saveOrder(currentOrder, itemAdditionHistory);
            const orderItems = document.getElementById('order-items');
            orderItems.innerHTML = '<div class="cart-empty"></div>';
            resetTopSection();
        });
    } else {
        console.error('New Bill button not found in DOM');
    }

    const mainMenuBtn = $('.control-btn:contains("Main Menu")');
    if (mainMenuBtn.length) {
        console.log('Main Menu button found, binding event...');
        mainMenuBtn.off('click').on('click', () => {
            console.log('Main Menu button clicked');
            const currentOrder = [];
            const itemAdditionHistory = [];
            isBilled = false;
            saveOrder(currentOrder, itemAdditionHistory);
            const orderItems = document.getElementById('order-items');
            orderItems.innerHTML = '<div class="cart-empty"></div>';
            resetTopSection();
        });
    } else {
        console.error('Main Menu button not found in DOM');
    }

    const billHistoryBtn = $('.control-btn:contains("Sales Report")');
    if (billHistoryBtn.length) {
        console.log('Bill History button found, binding event...');
        billHistoryBtn.off('click').on('click', () => {
            console.log('Bill History button clicked');
            try {
                $('.menu-grid').hide();
                $('.container').hide();
                $('#order-items').hide();
                $('.total-amount-section').hide();
                $('#cc1').show();
                isBilled = false;
                $('#cc1').html('');
                displayAllBills();
                resetTopSection();
            } catch (error) {
                console.error('Error in Bill History button handler:', error);
                alert('An error occurred while opening Bill History. Please try again or contact support.');
            }
        });
    } else {
        console.error('Bill History button not found in DOM');
    }

    const inventoryBtn = $('.control-btn:contains("Inventory")');
    if (inventoryBtn.length) {
        console.log('Inventory button found, binding event...');
        inventoryBtn.off('click').on('click', () => {
            console.log('Inventory button clicked');
            try {
                $('.menu-grid').hide();
                $('.container').hide();
                $('#order-items').hide();
                $('.total-amount-section').hide();
                $('#cc1').show();
                isBilled = false;
                $('#cc1').html('');
                displayInventory();
                resetTopSection();
            } catch (error) {
                console.error('Error in Inventory button handler:', error);
                alert('An error occurred while opening Inventory. Please try again or contact support.');
            }
        });
    } else {
        console.error('Inventory button not found in DOM');
    }
}

function returnToMainScreen() {
    console.log('Home button clicked');
    try {
        $('#cc1').hide();
        $('.menu-grid').show();
        $('.container').show();
        $('#order-items').show();
        $('.total-amount-section').show();
        const currentOrder = [];
        const itemAdditionHistory = [];
        isBilled = false;
        saveOrder(currentOrder, itemAdditionHistory);
        $('#order-items').html('<div class="cart-empty"></div>');
        resetTopSection();
        fetchMenuItems().then(() => {
            console.log('Menu items reloaded, refreshing order view');
            loadOrder();
        }).catch(error => {
            console.error('Failed to reload menu items:', error);
            alert('Failed to reload menu items. Please try again or contact support.');
        });
    } catch (error) {
        console.error('Error in Home button handler:', error);
        alert('An error occurred while returning to the main screen. Please try again or contact support.');
    }
}

function displayAllBills() {
    const cc = $('#cc1');
    if (!cc.length) {
        console.error('Element with id="cc1" not found in DOM');
        return;
    }

    cc.html(''); 
    cc.show(); 

    const salesContainer = $('<div>').css({ padding: '20px', backgroundColor: '#fff', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' });

    const headerContainer = $('<div>').css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
    });

    const heading = $('<h2>').text('Sales Report').css({
        color: 'orange',
        margin: '0',
        textAlign: 'center',
        flex: '1'
    });
    headerContainer.append(heading);

    const homeButton = $('<button>').attr('id', 'home-btn').text('Home').css({
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: 'orange',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        zIndex: '1000'
    });

    homeButton.off('click').on('click', returnToMainScreen);
    headerContainer.append(homeButton);
    salesContainer.append(headerContainer);

    const filterSection = $('<div>').css({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px'
    });

    const filterLabel = $('<label>').attr('for', 'filter').text('Filter By:');
    const filterSelect = $('<select>').attr('id', 'filter').css({
        padding: '5px',
        fontSize: '14px'
    }).append(
        $('<option>').val('').text('--Select--'),
        $('<option>').val('today').text('Today'),
        $('<option>').val('yesterday').text('Yesterday'),
        $('<option>').val('thisWeek').text('This Week'),
        $('<option>').val('lastWeek').text('Last Week'),
        $('<option>').val('thisMonth').text('This Month'),
        $('<option>').val('lastMonth').text('Last Month'),
        $('<option>').val('custom').text('Custom')
    );

    const customDateRange = $('<div>').attr('id', 'customDateRange').css({
        display: 'none',
        gap: '10px'
    }).append(
        $('<input>').attr({
            type: 'datetime-local',
            id: 'startDate'
        }).css({
            padding: '5px',
            fontSize: '14px'
        }),
        $('<span>').text('to'),
        $('<input>').attr({
            type: 'datetime-local',
            id: 'endDate'
        }).css({
            padding: '5px',
            fontSize: '14px'
        }),
        $('<button>').text('Apply').css({
            padding: '5px',
            fontSize: '14px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
        }).on('click', applyCustomDateRange)
    );

    filterSelect.on('change', handleFilterChange);
    filterSection.append(filterLabel, filterSelect, customDateRange);
    salesContainer.append(filterSection);

    const table = $('<table>').css({
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: '#fff',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
    });

    const thead = $('<thead>').append(
        $('<tr>').append(
            $('<th>').text('S.No').css({
                padding: '10px',
                textAlign: 'left',
                backgroundColor: '#4CAF50',
                color: 'white',
                borderBottom: '1px solid #ddd'
            }),
            $('<th>').text('Item Name').css({
                padding: '10px',
                textAlign: 'left',
                backgroundColor: '#4CAF50',
                color: 'white',
                borderBottom: '1px solid #ddd'
            }),
            $('<th>').text('Sold Quantity').css({
                padding: '10px',
                textAlign: 'left',
                backgroundColor: '#4CAF50',
                color: 'white',
                borderBottom: '1px solid #ddd'
            }),
            $('<th>').text('Total Price').css({
                padding: '10px',
                textAlign: 'left',
                backgroundColor: '#4CAF50',
                color: 'white',
                borderBottom: '1px solid #ddd'
            })
        )
    );

    const tbody = $('<tbody>').attr('id', 'salesTableBody');
    table.append(thead, tbody);
    salesContainer.append(table);

    cc.append(salesContainer);

    const allBills = getAllBills();
    renderSalesReport(allBills);

    function getAllBills() {
        const bills = JSON.parse(localStorage.getItem('bills')) || {};
        const allItems = [];
        Object.keys(bills).forEach(date => {
            bills[date].forEach(bill => {
                bill.items.forEach(item => {
                    const existingItem = allItems.find(i => i.name === item.name);
                    if (existingItem) {
                        existingItem.quantity += item.quantity;
                        existingItem.totalPrice += item.quantity * item.unitPrice;
                        existingItem.dates.push(bill.date);
                    } else {
                        allItems.push({
                            name: item.name,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.quantity * item.unitPrice,
                            dates: [bill.date]
                        });
                    }
                });
            });
        });
        return allItems;
    }

    function calculateTotalPrice(item) {
        return item.totalPrice.toFixed(2);
    }

    function renderSalesReport(data) {
        const tbody = $('#salesTableBody');
        tbody.html('');
        // Sort by item name alphabetically (A to Z)
        data.sort((a, b) => a.name.localeCompare(b.name));
        data.forEach((item, index) => {
            const row = $('<tr>').css({
                backgroundColor: index % 2 === 0 ? '#f2f2f2' : '#fff'
            }).append(
                $('<td>').text(index + 1).css({
                    padding: '10px',
                    borderBottom: '1px solid #ddd'
                }),
                $('<td>').text(item.name).css({
                    padding: '10px',
                    borderBottom: '1px solid #ddd'
                }),
                $('<td>').text(item.quantity).css({
                    padding: '10px',
                    borderBottom: '1px solid #ddd'
                }),
                $('<td>').text(`$${calculateTotalPrice(item)}`).css({
                    padding: '10px',
                    borderBottom: '1px solid #ddd'
                })
            );
            tbody.append(row);
        });
    }

    function filterDataByDate(startDate, endDate) {
        const allBills = getAllBills();
        const filteredItems = [];
        allBills.forEach(item => {
            const itemDates = item.dates.map(date => new Date(date));
            const withinRange = itemDates.some(date => date >= startDate && date <= endDate);
            if (withinRange) {
                const filteredQuantity = itemDates.reduce((sum, date, idx) => {
                    if (date >= startDate && date <= endDate) {
                        const quantityPerDate = item.quantity / item.dates.length;
                        return sum + quantityPerDate;
                    }
                    return sum;
                }, 0);
                filteredItems.push({
                    name: item.name,
                    quantity: Math.round(filteredQuantity),
                    unitPrice: item.unitPrice,
                    totalPrice: Math.round(filteredQuantity) * item.unitPrice,
                    dates: item.dates
                });
            }
        });
        return filteredItems;
    }

    function handleFilterChange() {
        const filter = $('#filter').val();
        const customDateRangeDiv = $('#customDateRange');
        const today = new Date('2025-06-10T11:52:00');
        let startDate, endDate;

        if (filter === 'custom') {
            customDateRangeDiv.css('display', 'flex');
            return;
        } else {
            customDateRangeDiv.css('display', 'none');
        }

        if (filter === 'today') {
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
            endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        } else if (filter === 'yesterday') {
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 0, 0, 0);
            endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59, 59);
        } else if (filter === 'thisWeek') {
            const firstDayOfWeek = new Date(today);
            firstDayOfWeek.setDate(today.getDate() - today.getDay());
            startDate = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate(), 0, 0, 0);
            endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        } else if (filter === 'lastWeek') {
            const firstDayOfLastWeek = new Date(today);
            firstDayOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
            const lastDayOfLastWeek = new Date(firstDayOfLastWeek);
            lastDayOfLastWeek.setDate(firstDayOfLastWeek.getDate() + 6);
            startDate = new Date(firstDayOfLastWeek.getFullYear(), firstDayOfLastWeek.getMonth(), firstDayOfLastWeek.getDate(), 0, 0, 0);
            endDate = new Date(lastDayOfLastWeek.getFullYear(), lastDayOfLastWeek.getMonth(), lastDayOfLastWeek.getDate(), 23, 59, 59);
        } else if (filter === 'thisMonth') {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
            endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        } else if (filter === 'lastMonth') {
            const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            startDate = new Date(firstDayOfLastMonth.getFullYear(), firstDayOfLastMonth.getMonth(), 1, 0, 0, 0);
            endDate = new Date(lastDayOfLastMonth.getFullYear(), lastDayOfLastMonth.getMonth(), lastDayOfLastMonth.getDate(), 23, 59, 59);
        } else {
            renderSalesReport(getAllBills());
            return;
        }

        const filteredData = filterDataByDate(startDate, endDate);
        renderSalesReport(filteredData);
    }

    function applyCustomDateRange() {
        const startDateInput = $('#startDate').val();
        const endDateInput = $('#endDate').val();

        if (!startDateInput || !endDateInput) {
            alert('Please select both start and end dates.');
            return;
        }

        const startDate = new Date(startDateInput);
        const endDate = new Date(endDateInput);

        if (startDate > endDate) {
            alert('Start date cannot be later than end date.');
            return;
        }

        const filteredData = filterDataByDate(startDate, endDate);
        renderSalesReport(filteredData);
    }
}

function displayInventory() {
    const cc = $('#cc1');
    if (!cc.length) {
        console.error('Element with id="cc1" not found in DOM');
        return;
    }

    cc.html(''); 
    cc.show(); 

    const inventoryContainer = $('<div>').css({ padding: '20px', backgroundColor: '#fff', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' });

    const headerContainer = $('<div>').css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
    });

    const heading = $('<h2>').text('Inventory').css({
        color: 'orange',
        margin: '0',
        textAlign: 'center',
        flex: '1'
    });
    headerContainer.append(heading);

    const homeButton = $('<button>').attr('id', 'home-btn').text('Home').css({
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: 'orange',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        zIndex: '1000'
    });

    homeButton.off('click').on('click', returnToMainScreen);
    headerContainer.append(homeButton);
    inventoryContainer.append(headerContainer);

    const filterSection = $('<div>').css({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px'
    });

    const filterLabel = $('<label>').attr('for', 'filter').text('Filter By:');
    const filterSelect = $('<select>').attr('id', 'filter').css({
        padding: '5px',
        fontSize: '14px'
    }).append(
        $('<option>').val('').text('--Select--'),
        $('<option>').val('today').text('Today'),
        $('<option>').val('yesterday').text('Yesterday'),
        $('<option>').val('thisWeek').text('This Week'),
        $('<option>').val('lastWeek').text('Last Week'),
        $('<option>').val('thisMonth').text('This Month'),
        $('<option>').val('lastMonth').text('Last Month'),
        $('<option>').val('custom').text('Custom')
    );
    const customDateRange = $('<div>').attr('id', 'customDateRange').css({
        display: 'none',
        gap: '10px'
    }).append(
        $('<input>').attr({
            type: 'datetime-local',
            id: 'startDate'
        }).css({
            padding: '5px',
            fontSize: '14px'
        }),
        $('<span>').text('to'),
        $('<input>').attr({
            type: 'datetime-local',
            id: 'endDate'
        }).css({
            padding: '5px',
            fontSize: '14px'
        }),
        $('<button>').text('Apply').css({
            padding: '5px',
            fontSize: '14px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
        }).on('click', applyCustomDateRangeInventory)
    );
    filterSelect.on('change', handleFilterChangeInventory);
    filterSection.append(filterLabel, filterSelect, customDateRange);
    inventoryContainer.append(filterSection);
    const table = $('<table>').css({
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: '#fff',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
    });
    const thead = $('<thead>').append(
        $('<tr>').append(
            $('<th>').text('S.No').css({
                padding: '10px',
                textAlign: 'left',
                backgroundColor: '#4CAF50',
                color: 'white',
                borderBottom: '1px solid #ddd'
            }),
            $('<th>').text('Item Name').css({
                padding: '10px',
                textAlign: 'left',
                backgroundColor: '#4CAF50',
                color: 'white',
                borderBottom: '1px solid #ddd'
            }),
            $('<th>').text('Purchased').css({
                padding: '10px',
                textAlign: 'left',
                backgroundColor: '#4CAF50',
                color: 'white',
                borderBottom: '1px solid #ddd'
            }),
            $('<th>').text('Sold').css({
                padding: '10px',
                textAlign: 'left',
                backgroundColor: '#4CAF50',
                color: 'white',
                borderBottom: '1px solid #ddd'
            }),
            $('<th>').text('In Stock').css({
                padding: '10px',
                textAlign: 'left',
                backgroundColor: '#4CAF50',
                color: 'white',
                borderBottom: '1px solid #ddd'
            })
        )
    );
    const tbody = $('<tbody>').attr('id', 'inventoryTableBody');
    table.append(thead, tbody);
    inventoryContainer.append(table);
    cc.append(inventoryContainer);
    const inventoryData = getInventoryData();
    renderInventoryReport(inventoryData);

    function getInventoryData() {
        const bills = JSON.parse(localStorage.getItem('bills')) || {};
        const inventoryItems = [];
        menuItemsWithDates.forEach(menuItem => {
            inventoryItems.push({
                name: menuItem.name,
                purchased: menuItem.quantityPurchased,
                sold: 0,
                dates: []
            });
        });
        Object.keys(bills).forEach(date => {
            bills[date].forEach(bill => {
                bill.items.forEach(item => {
                    const inventoryItem = inventoryItems.find(i => i.name === item.name);
                    if (inventoryItem) {
                        inventoryItem.sold += item.quantity;
                        inventoryItem.dates.push(bill.date);
                    } else {
                        inventoryItems.push({
                            name: item.name,
                            purchased: 0,
                            sold: item.quantity,
                            dates: [bill.date]
                        });
                    }
                });
            });
        });
        inventoryItems.forEach(item => {
            item.inStock = item.purchased - item.sold;
        });

        return inventoryItems;
    }

    function renderInventoryReport(data) {
        const tbody = $('#inventoryTableBody');
        if (!tbody.length) {
            console.error('Inventory table body not found in DOM');
            return;
        }
        tbody.html('');
        data.sort((a, b) => a.name.localeCompare(b.name));
        data.forEach((item, index) => {
            const row = $('<tr>').css({
                backgroundColor: index % 2 === 0 ? '#f2f2f2' : '#fff'
            }).append(
                $('<td>').text(index + 1).css({
                    padding: '10px',
                    borderBottom: '1px solid #ddd'
                }),
                $('<td>').text(item.name).css({
                    padding: '10px',
                    borderBottom: '1px solid #ddd'
                }),
                $('<td>').text(item.purchased).css({
                    padding: '10px',
                    borderBottom: '1px solid #ddd'
                }),
                $('<td>').text(item.sold).css({
                    padding: '10px',
                    borderBottom: '1px solid #ddd'
                }),
                $('<td>').text(item.inStock).css({
                    padding: '10px',
                    borderBottom: '1px solid #ddd'
                })
            );
            tbody.append(row);
        });
    }

    function filterInventoryDataByDate(startDate, endDate) {
        const inventoryData = getInventoryData();
        const filteredItems = [];
        inventoryData.forEach(item => {
            const itemDates = item.dates.map(date => new Date(date));
            const withinRange = itemDates.length === 0 || itemDates.some(date => date >= startDate && date <= endDate);
            if (withinRange) {
                let filteredSold = 0;
                if (item.dates.length > 0) {
                    filteredSold = itemDates.reduce((sum, date, idx) => {
                        if (date >= startDate && date <= endDate) {
                            const soldPerDate = item.sold / item.dates.length;
                            return sum + soldPerDate;
                        }
                        return sum;
                    }, 0);
                }
                filteredItems.push({
                    name: item.name,
                    purchased: item.purchased,
                    sold: Math.round(filteredSold),
                    inStock: item.purchased - Math.round(filteredSold),
                    dates: item.dates
                });
            }
        });
        return filteredItems;
    }

    function handleFilterChangeInventory() {
        const filter = $('#filter').val();
        const customDateRangeDiv = $('#customDateRange');
        const today = new Date('2025-06-10T11:52:00');
        let startDate, endDate;

        if (filter === 'custom') {
            customDateRangeDiv.css('display', 'flex');
            return;
        } else {
            customDateRangeDiv.css('display', 'none');
        }
        if (filter === 'today') {
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
            endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        } else if (filter === 'yesterday') {
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 0, 0, 0);
            endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59, 59);
        } else if (filter === 'thisWeek') {
            const firstDayOfWeek = new Date(today);
            firstDayOfWeek.setDate(today.getDate() - today.getDay());
            startDate = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate(), 0, 0, 0);
            endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        } else if (filter === 'lastWeek') {
            const firstDayOfLastWeek = new Date(today);
            firstDayOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
            const lastDayOfLastWeek = new Date(firstDayOfLastWeek);
            lastDayOfLastWeek.setDate(firstDayOfLastWeek.getDate() + 6);
            startDate = new Date(firstDayOfLastWeek.getFullYear(), firstDayOfLastWeek.getMonth(), firstDayOfLastWeek.getDate(), 0, 0, 0);
            endDate = new Date(lastDayOfLastWeek.getFullYear(), lastDayOfLastWeek.getMonth(), lastDayOfLastWeek.getDate(), 23, 59, 59);
        } else if (filter === 'thisMonth') {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
            endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        } else if (filter === 'lastMonth') {
            const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            startDate = new Date(firstDayOfLastMonth.getFullYear(), firstDayOfLastMonth.getMonth(), 1, 0, 0, 0);
            endDate = new Date(lastDayOfLastMonth.getFullYear(), lastDayOfLastMonth.getMonth(), lastDayOfLastMonth.getDate(), 23, 59, 59);
        } else {
            renderInventoryReport(getInventoryData());
            return;
        }
        const filteredData = filterInventoryDataByDate(startDate, endDate);
        renderInventoryReport(filteredData);
    }

    function applyCustomDateRangeInventory() {
        const startDateInput = $('#startDate').val();
        const endDateInput = $('#endDate').val();
        if (!startDateInput || !endDateInput) {
            alert('Please select both start and end dates.');
            return;
        }
        const startDate = new Date(startDateInput);
        const endDate = new Date(endDateInput);
        if (startDate > endDate) {
            alert('Start date cannot be later than end date.');
            return;
        }
        const filteredData = filterInventoryDataByDate(startDate, endDate);
        renderInventoryReport(filteredData);
    }
}

function updateInventory() {
    const inventoryVisible = $('#cc1').is(':visible') && $('#cc1 h2').text() === 'Inventory';
    if (inventoryVisible) {
        console.log('Inventory screen is visible, updating inventory data...');
        const filterValue = $('#filter').val();
        if (filterValue && filterValue !== 'custom') {
            handleFilterChangeInventory();
        } else if (filterValue === 'custom') {
            applyCustomDateRangeInventory();
        } else {
            const inventoryData = getInventoryData();
            renderInventoryReport(inventoryData);
        }
    } else {
        console.log('Inventory screen is not visible, no update needed.');
    }
}

function fetchMenuItems() {
    return new Promise((resolve, reject) => {
        if (isMenuLoaded) {
            console.log('Menu already loaded, skipping fetch.');
            resolve();
            return;
        }
        console.log('Fetching menu items from data.json...');
        $(document).ready(function () {
            fetch('data.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch data.json');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Menu items data:', data);
                    menuItemsData = data;
                    const menuGrid = $('.menu-grid');
                    menuGrid.empty();
                    data.forEach(item => {
                        const imageName = item.name.toLowerCase().replace(/[\s&()]/g, '_');
                        const imagePath = `images/${imageName}.png`;
                        const html = `
                            <div class="menu-item" data-name="${item.name}">
                                <img src="${imagePath}" alt="${item.name}" class="menu-item-img" style="height:100px;width:100px;">
                                <div class="menu-item-name" style="font-size:14px">${item.name}</div>
                            </div>
                        `;
                        menuGrid.append(html);
                    });
                    $('.menu-item').off('click').on('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const itemName = $(this).data('name');
                        console.log('Clicked item:', itemName);
                        const menuItem = menuItemsData.find(i => i.name === itemName);
                        if (menuItem) {
                            console.log(`Adding item: ${itemName}, unitPrice: ${menuItem.unitPrice}`);
                            addItem(itemName, 1, menuItem.unitPrice);
                        } else {
                            console.error(`Menu item not found: ${itemName}`);
                        }
                        console.log('Menu grid HTML after click:', menuGrid.html().substring(0, 100) + '...');
                    });
                    isMenuLoaded = true;
                    resolve();
                })
                .catch(error => {
                    console.error('Error loading menu items:', error);
                    reject(error);
                });
        });
    });
}

function loadOrder() {
    const orderItems = document.getElementById('order-items');
    const currentOrder = JSON.parse(localStorage.getItem('currentOrder')) || [];

    if (isBilled) {
        const lastBill = JSON.parse(localStorage.getItem('bills'))?.[new Date().toISOString().split('T')[0]]?.slice(-1)[0];
        if (lastBill) {
            displayBill(lastBill);
        }
        return;
    }

    orderItems.innerHTML = '';
    if (currentOrder.length === 0) {
        orderItems.innerHTML = '<div class="cart-empty"></div>';
    } else {
        currentOrder.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'order-row';
            itemDiv.innerHTML = `
                <div class="item-col">${item.name}</div>
                <div class="qty-col">${item.quantity}</div>
                <div class="price-col">$${item.unitPrice}</div>
                <div class="total-col">$${(item.quantity * item.unitPrice).toFixed(2)}</div>
            `;
            orderItems.appendChild(itemDiv);
        });
    }
    updateTotalPrice();
}

function displayBill(bill, payable) {
    const orderItems = document.getElementById('order-items');
    orderItems.innerHTML = ''; 

    const billDiv = document.createElement('div');
    billDiv.className = 'bill-summary';
    const formattedDate = new Date(bill.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit'
    });
    billDiv.innerHTML = `
        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; gap:10px;">
            <h3>Bill Summary</h3>
            <div><strong>Date:</strong> ${formattedDate}</div>
            <hr style="width:80%; color:black;">
            <div><strong>Amount:</strong> $${bill.total.toFixed(2)}</div>
            <div><strong>GST Amount (18%):</strong> $${bill.gst.toFixed(2)}</div>
            <hr style="width:80%; color:black;">
            <div><strong style="color:red;">Payable:</strong> $${bill.payable.toFixed(2)}</div>
            <hr style="width:80%;">
            <div><strong>Tender:</strong> $<span id="tender-amount">${bill.tender.toFixed(2)}</span></div>
            <div><strong>Change:</strong> $<span id="change-amount">${bill.change.toFixed(2)}</span></div>
        </div>
    `;
    orderItems.appendChild(billDiv);

    const itemsDiv = document.createElement('div');
    itemsDiv.className = 'bill-items';
    itemsDiv.style.marginTop = '20px';
    itemsDiv.innerHTML = '<h4>Items</h4><hr style="width:80%; color:black;">';
    bill.items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'bill-item';
        itemDiv.style.display = 'flex';
        itemDiv.style.justifyContent = 'space-between';
        itemDiv.innerHTML = `
            <span>${item.name}</span>
            <span>Qty: ${item.quantity} x $${item.unitPrice.toFixed(2)} = $${(item.quantity * item.unitPrice).toFixed(2)}</span>
        `;
        itemsDiv.appendChild(itemDiv);
    });
    orderItems.appendChild(itemsDiv);

    if (payable) {
        const tenderButtonsDiv = document.createElement('div');
        tenderButtonsDiv.className = 'tender-buttons';
        tenderButtonsDiv.style.marginTop = '10px';
        tenderButtonsDiv.style.display = 'flex';
        tenderButtonsDiv.style.gap = '10px';
        tenderButtonsDiv.style.justifyContent = 'center';

        tenderButtonsDiv.innerHTML = `
            <input type="number" id="manual-tender-input" placeholder="Enter amount" style="width:130px;font-size:16px;padding:4px;border-radius:5px;" />
            <button class="save-tender-btn" style="font-size:18px;border-radius:5px;background-color:lightblue;">Save</button>
        `;
        billDiv.appendChild(tenderButtonsDiv);

        let currentTender = bill.tender;

        const updateTenderDisplay = () => {
            document.getElementById('tender-amount').textContent = currentTender.toFixed(2);
            const currentChange = currentTender - bill.payable;
            document.getElementById('change-amount').textContent = currentChange.toFixed(2);
        };

        $('#b10').off('click').on('click', () => {
            currentTender += 10;
            updateTenderDisplay();
        });

        $('#b2').off('click').on('click', () => {
            currentTender += 2;
            updateTenderDisplay();
        });

        $('#b5').off('click').on('click', () => {
            currentTender += 5;
            updateTenderDisplay();
        });

        $('#b50').off('click').on('click', () => {
            currentTender += 50;
            updateTenderDisplay();
        });

        $('.save-tender-btn').off('click').on('click', () => {
            const manualInput = parseFloat(document.getElementById('manual-tender-input').value);
            if (!isNaN(manualInput)) {
                currentTender = manualInput;
                updateTenderDisplay();
            }
            if (currentTender < bill.payable || currentTender > (bill.payable * 10)) {
                alert(`Invalid tender amount. It must be between $${bill.payable.toFixed(2)} and $${(bill.payable * 10).toFixed(2)}.`);
                return;
            }
            console.log('Tender saved:', currentTender);

            bill.tender = currentTender;
            bill.change = currentTender - bill.payable;

            const date = new Date().toISOString().split('T')[0];
            bill.id = x;
            x += 1;
            bill.date = new Date().toISOString();

            const bills = JSON.parse(localStorage.getItem('bills')) || {};
            if (!bills[date]) {
                bills[date] = [];
            }
            bills[date].push(bill);
            localStorage.setItem('bills', JSON.stringify(bills));

            tenderButtonsDiv.remove();

            document.getElementById('tender-amount').textContent = bill.tender.toFixed(2);
            document.getElementById('change-amount').textContent = bill.change.toFixed(2);

            updateTopSectionToChange('Change', bill.change);

            updateInventory();
        });
    } else {
        updateTopSectionToChange('Change', bill.change);
    }
}

function updateTopSectionToChange(label, value) {
    const totalAmountSection = document.querySelector('.total-amount-section');
    if (totalAmountSection) {
        const totalPriceSpan = document.getElementById('total-price');
        if (totalPriceSpan) {
            const numericValue = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(numericValue)) {
                console.error('Value is not a valid number:', value);
                totalPriceSpan.textContent = '0.00';
            } else {
                totalPriceSpan.textContent = numericValue.toFixed(2);
            }
            totalAmountSection.innerHTML = `${label}: $<span id="total-price">${totalPriceSpan.textContent}</span>`;
        } else {
            console.error('Total price span not found in DOM');
            resetTopSection();
            const numericValue = typeof value === 'string' ? parseFloat(value) : value;
            const formattedValue = isNaN(numericValue) ? '0.00' : numericValue.toFixed(2);
            document.querySelector('.total-amount-section').innerHTML = `${label}: $<span id="total-price">${formattedValue}</span>`;
        }
    } else {
        console.error('Total amount section not found in DOM');
    }
}

function resetTopSection() {
    const totalAmountSection = document.querySelector('.total-amount-section');
    if (totalAmountSection) {
        totalAmountSection.innerHTML = `Total Price: $<span id="total-price">0.00</span>`;
    } else {
        console.error('Total amount section not found in DOM');
    }
}

function saveOrder(order, history) {
    console.log('Saving order:', order);
    console.log('Saving item addition history:', history);
    localStorage.setItem('currentOrder', JSON.stringify(order));
    localStorage.setItem('itemAdditionHistory', JSON.stringify(history));
}

function addItem(name, quantity, unitPrice) {
    if (!name || quantity <= 0 || !unitPrice) {
        console.error('Invalid item data:', { name, quantity, unitPrice });
        return;
    }
    let currentOrder = JSON.parse(localStorage.getItem('currentOrder')) || [];
    let itemAdditionHistory = JSON.parse(localStorage.getItem('itemAdditionHistory')) || [];
    const existingItem = currentOrder.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += quantity;
        console.log(`Increased quantity for ${name}: ${existingItem.quantity}`);
    } else {
        currentOrder.push({ name, quantity, unitPrice });
        console.log(`Added new item: ${name}`);
    }
    itemAdditionHistory.push(name);
    saveOrder(currentOrder, itemAdditionHistory);
    loadOrder();
}

function updateTotalPrice() {
    const currentOrder = JSON.parse(localStorage.getItem('currentOrder')) || [];
    const total = currentOrder.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    if (!isBilled) {
        console.log('Updating total price section:', { total });
        const totalPriceElement = document.getElementById('total-price');
        if (totalPriceElement) {
            totalPriceElement.textContent = total.toFixed(2);
            const totalAmountSection = document.querySelector('.total-amount-section');
            if (totalAmountSection) {
                totalAmountSection.innerHTML = `Total Price: $<span id="total-price">${total.toFixed(2)}</span>`;
            }
        } else {
            console.warn('Total price element not found in DOM');
            resetTopSection();
            document.getElementById('total-price').textContent = total.toFixed(2);
            document.querySelector('.total-amount-section').innerHTML = `Total Price: $<span id="total-price">${total.toFixed(2)}</span>`;
        }
    } else {
        console.log('Skipping total price update because isBilled is true');
    }

    console.log('Total price updated:', { total: total.toFixed(2) });
}