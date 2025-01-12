import React, { useState, useEffect } from "react";
import Card from "../Layout/Card";
import styled from "styled-components";
import { FaTruck } from "react-icons/fa"; // Icon for delivered orders
import { fetchSupplierDelivery } from "../../api/SupplierDeliveryApi";

const CardTotalDelivered = () => {
  const [deliveredCount, setDeliveredCount] = useState(0);

  useEffect(() => {
    const fetchDeliveredOrders = async () => {
      try {
        const data = await fetchSupplierDelivery();
        setDeliveredCount(
          data.filter((order) => order.INBOUND_DEL_STATUS === "Delivered").length
        );
      } catch (error) {
        console.error("Error fetching delivered orders:", error);
      }
    };

    fetchDeliveredOrders();
    const intervalId = setInterval(fetchDeliveredOrders, 20000); // Refresh every 20 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <CardContainer>
      <Card
        label="Delivered Orders"
        value={deliveredCount}
        icon={<FaTruck />} // Truck icon for delivered orders
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalDelivered;
