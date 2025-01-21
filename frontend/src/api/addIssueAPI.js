import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const createDeliveryIssue = async (
  orderType,
  issueType,
  resolution,
  deliveryType,
  outboundDeliveryId,
  remarks,
  deliveryIssueData
) => {
  try {
    // Prepare the payload for POST request, mapping your fields to match expected fields
    const requestData = {
      ORDER_TYPE: orderType,
      ISSUE_TYPE: issueType,
      RESOLUTION: resolution,
      DELIVERY_TYPE: deliveryType, // e.g., "outbounddelivery" or "inbounddelivery"
      DELIVERY_ID: outboundDeliveryId, // ID of the delivery (inbound or outbound)
      REMARKS: remarks,
      item_issues: deliveryIssueData.map((item) => ({
        ISSUE_PROD_ID: item.OUTBOUND_DETAILS_PROD_ID,
        ISSUE_PROD_NAME: item.OUTBOUND_DETAILS_PROD_NAME,
        ISSUE_QTY_DEFECT: item.OUTBOUND_DETAILS_PROD_QTY_DEFECT,
        ISSUE_PROD_LINE_PRICE: item.OUTBOUND_DETAILS_SELL_PRICE,
        ISSUE_LINE_TOTAL_PRICE: item.OUTBOUND_DETAIL_LINE_TOTAL,
      })),
    };

    // Send POST request to the backend API
    const response = await fetch(`${API_BASE_URL}/api/delivery/issue/submit/`, {
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
    return { status: response.status, data: responseData };
  } catch (error) {
    console.error("Error creating delivery issue:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const createInboundDeliveryIssue = async (
  orderType,
  issueType,
  resolution,
  deliveryType,
  inboundDeliveryId,
  remarks,
  deliveryIssueData
) => {
  try {
    // Prepare the payload for POST request, mapping your fields to match expected fields
    const requestData = {
      ORDER_TYPE: orderType,
      ISSUE_TYPE: issueType,
      RESOLUTION: resolution,
      DELIVERY_TYPE: deliveryType, // e.g., "outbounddelivery" or "inbounddelivery"
      DELIVERY_ID: inboundDeliveryId, // ID of the delivery (inbound or outbound)
      REMARKS: remarks,
      item_issues: deliveryIssueData.map((item) => ({
        ISSUE_PROD_ID: item.INBOUND_DEL_DETAIL_PROD_ID,
        ISSUE_PROD_NAME: item.INBOUND_DEL_DETAIL_PROD_NAME,
        ISSUE_QTY_DEFECT: item.INBOUND_DEL_DETAIL_LINE_QTY_DEFECT,
        ISSUE_PROD_LINE_PRICE: item.INBOUND_DEL_DETAIL_LINE_PRICE,
        ISSUE_LINE_TOTAL_PRICE: (
          item.INBOUND_DEL_DETAIL_LINE_PRICE *
          item.INBOUND_DEL_DETAIL_LINE_QTY_DEFECT
        ).toFixed(2),
      })),
    };

    // Send POST request to the backend API
    const response = await fetch(`${API_BASE_URL}/api/delivery/issue/submit/`, {
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
    return { status: response.status, data: responseData };
  } catch (error) {
    console.error("Error creating delivery issue:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
