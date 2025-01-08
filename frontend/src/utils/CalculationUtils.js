// Function to calculate the total price for a line item, including applying any discounts
export const calculateLineTotal = (item) => {
  const price = parseFloat(item.price) || 0;
  const discount = parseFloat(item.discount) || 0;
  const quantity = parseInt(item.quantity, 10) || 0;
  const discountValue = ((price * discount) / 100) * quantity;
  const lineTotal = price * quantity - discountValue;
  return lineTotal;
};

// Function to calculate the discount amount based on the discount type and value
export const calculateDiscountAmount = (detail) => {
  let discountAmount = 0;

  const price = parseFloat(detail.price) || 0;
  const discountValue = parseFloat(detail.discountValue) || 0;
  const quantity = parseInt(detail.quantity, 10) || 0;

  discountAmount = Math.min(discountValue, quantity * price);
  return discountAmount;
};

// Function to calculate the total quantity of all items in the order
export const calculateTotalQuantity = (orderDetails) => {
  return orderDetails.reduce((acc, item) => acc + item.quantity, 0);
};

// Function to calculate the total value of all items in the order, considering the discount
export const calculateTotalValue = (orderDetails) => {
  return orderDetails.reduce((acc, item) => {
    const lineTotal = calculateLineTotal(item); // Use calculateLineTotal to get the adjusted total for each item
    return acc + lineTotal;
  }, 0);
};

// Function to calculate the total discount of all items in the order
export const calculateTotalDiscount = (orderDetails) => {
  // console.log("Order Details:", orderDetails); // Debugging line
  return orderDetails.reduce((acc, item) => {
    const discountAmount = calculateDiscountAmount(item);
    // console.log("Item:", item, "Discount Amount:", discountAmount); // Debugging line
    return acc + discountAmount;
  }, 0);
};
