import React, { useState, useEffect } from "react";
import Card from "../Layout/Card";
import styled from "styled-components";
import { FaHourglassHalf } from "react-icons/fa"; // Icon for pending orders
import { fetchSupplierDelivery } from "../../api/SupplierDeliveryApi";

const PendingSuppDel = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const data = await fetchSupplierDelivery();
        setPendingCount(
          data.filter((order) => order.INBOUND_DEL_STATUS === "Pending").length
        );
      } catch (error) {
        console.error("Error fetching pending orders:", error);
      }
    };

    fetchPendingOrders();
    const intervalId = setInterval(fetchPendingOrders, 20000); // Refresh every 20 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <CardContainer>
      <Card
        label="Pending Deliveries"
        value={pendingCount}
        icon={<FaHourglassHalf />} // Hourglass icon for pending orders
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default PendingSuppDel;
