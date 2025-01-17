import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const createDeliveryIssue = async (deliveryIssueData) => {
  try {
    // Prepare the payload for POST request, mapping your fields to match expected fields
    const requestData = {
      ORDER_TYPE: deliveryIssueData.ORDER_TYPE,
      ISSUE_TYPE: deliveryIssueData.ISSUE_TYPE,
      RESOLUTION: deliveryIssueData.RESOLUTION,
      DELIVERY_TYPE: deliveryIssueData.DELIVERY_TYPE, // e.g., "outbounddelivery" or "inbounddelivery"
      DELIVERY_ID: deliveryIssueData.DELIVERY_ID, // ID of the delivery (inbound or outbound)
      REMARKS: deliveryIssueData.REMARKS,
      item_issues: deliveryIssueData.item_issues.map((item) => ({
        ISSUE_PROD_ID: item.OUTBOUND_DETAILS_PROD_ID,
        ISSUE_PROD_NAME: item.OUTBOUND_DETAILS_PROD_NAME,
        ISSUE_QTY_DEFECT: item.OUTBOUND_DETAILS_PROD_QTY_DEFECT,
        ISSUE_QTY_ACCEPTED: item.OUTBOUND_DETAILS_PROD_QTY_ACCEPTED,
        ISSUE_QTY_ORDERED: item.OUTBOUND_DETAILS_PROD_QTY_ORDERED,
        ISSUE_PROD_LINE_PRICE: item.OUTBOUND_DETAILS_SELL_PRICE,
        ISSUE_LINE_TOTAL_PRICE: item.OUTBOUND_DETAIL_LINE_TOTAL,
        // Assuming you want to store the discount value in the item as well
        ISSUE_LINE_DISCOUNT: item.OUTBOUND_DETAILS_LINE_DISCOUNT,
      })),
    };

    // Send POST request to the backend API
    const response = await fetch(`${API_BASE_URL}/api/delivery/issue/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create delivery issue");
    }

    // Parse the JSON response
    const responseData = await response.json();

    // Return the response data (e.g., the created delivery issue with items)
    return responseData;
  } catch (error) {
    console.error("Error creating delivery issue:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
