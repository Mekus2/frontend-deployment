import React, { useEffect, useState } from "react";
import Card from "../Layout/Card";
import styled from "styled-components";
import { FaDollarSign } from "react-icons/fa";
import { fetchCustomerOrders } from "../../api/fetchCustomerOrders";

const CardTotalPendingPayment = () => {
  const [pendingPaymentCount, setPendingPaymentCount] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orders = await fetchCustomerOrders();
        setPendingPaymentCount(
          orders.filter((order) => order.SALES_ORDER_STATUS === "Pending").length
        );
      } catch (error) {
        console.error("Error fetching customer orders:", error);
      }
    };

    fetchOrders();
    const intervalId = setInterval(fetchOrders, 20000); // Refresh every 20 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  return (
    <CardContainer>
      <Card
        label="Pending Payments"
        value={pendingPaymentCount}
        icon={<FaDollarSign />} // Icon for payments
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalPendingPayment;
