import React, { useEffect, useState } from "react";
import Card from "../Layout/Card";
import styled from "styled-components";
import { FaHourglassHalf } from "react-icons/fa";
import { fetchPurchaseOrders } from "../../api/fetchPurchaseOrders";

const TotalPendingOrders = () => {
  const [pendingOrderCount, setPendingOrderCount] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orders = await fetchPurchaseOrders();
        setPendingOrderCount(
          orders.filter((order) => order.PURCHASE_ORDER_STATUS === "Pending")
            .length
        );
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
      }
    };

    fetchOrders();
    const intervalId = setInterval(fetchOrders, 20000); 

    return () => clearInterval(intervalId); 
  }, []);

  return (
    <CardContainer>
      <Card
        label="Pending Orders"
        value={pendingOrderCount}
        icon={<FaHourglassHalf />} 
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default TotalPendingOrders;
