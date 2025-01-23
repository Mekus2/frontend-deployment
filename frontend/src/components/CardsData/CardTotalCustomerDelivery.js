import React, { useState, useEffect } from "react";
import Card from "../Layout/Card";
import styled from "styled-components";
import { FaClipboardList } from "react-icons/fa"; // Icon for all orders
import { fetchCustomerDelivery } from "../../api/CustomerDeliveryApi";

const CardTotalCustomerDelivery = () => {
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await fetchCustomerDelivery();
        setTotalOrders(data.length);
      } catch (error) {
        console.error("Error fetching total orders:", error);
      }
    };

    fetchOrders();
    const intervalId = setInterval(fetchOrders, 20000); // Refresh every 20 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <CardContainer>
      <Card
        label="Total Customer Deliveries"
        value={totalOrders}
        icon={<FaClipboardList />} // Clipboard icon for all orders
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalCustomerDelivery;
