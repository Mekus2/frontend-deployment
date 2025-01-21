import React, { useEffect, useState } from "react";
import Card from "../Layout/Card"; // Reusable Card component
import styled from "styled-components";
import { FaClipboardList } from "react-icons/fa"; // Icon for customer orders
import { fetchCustomerOrders } from "../../api/fetchCustomerOrders"; // API for fetching customer orders

const CardTotalCustomerOrder = () => {
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      const orders = await fetchCustomerOrders();
      setTotalOrders(orders.length);
    };

    fetchOrders();
    const intervalId = setInterval(fetchOrders, 20000); // Refresh every 20 seconds
    return () => clearInterval(intervalId);
  }, []);

  return (
    <CardContainer>
      <Card
        label="Customer Orders"
        value={totalOrders} // Display the total number of customer orders
        icon={<FaClipboardList />} // Icon for customer orders
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalCustomerOrder;
