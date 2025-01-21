import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import LowestStocks from "../../components/Dashboard/LowestStocks";
import CardTotalProducts from "../../components/CardsData/CardTotalProducts";
import CardTotalSales from "../../components/CardsData/CardTotalSales";
import CardTotalInventoryValue from "../../components/CardsData/CardTotalInventoryValue";
import CardTotalCustomerOrder from "../../components/CardsData/CardTotalCustomerOrder";
import CardTotalCustomers from "../../components/CardsData/CardTotalCustomers";
import CardTotalDelivery from "../../components/CardsData/CardTotalDelivery";
import CardTotalLogs from "../../components/CardsData/CardTotalLogs";
import CardTotalSupplierOrder from "../../components/CardsData/CardTotalSupplierOrder";
import CardTotalReturns from "../../components/CardsData/CardTotalReturns";
import CardTotalSuppliers from "../../components/CardsData/CardTotalSuppliers";
import CardTotalTransactions from "../../components/CardsData/CardTotalTransactions";
import CardTotalUsers from "../../components/CardsData/CardTotalUsers";
import CardTotalPendingOrders from "../../components/CardsData/CardTotalPendingOrders";
import CardTotalPendingPayment from "../../components/CardsData/CardTotalPendingPayment";
import ExpiredItemsAlert from "../../components/Dashboard/ExpiredItemsAlert";
import MainLayout from "../../components/Layout/MainLayout";
import { checkUserAccess } from "../../api/authUtils";
import RevenueGraph from "../../components/Dashboard/RevenueGraph";

const SuperAdminDashboard = () => {
  checkUserAccess();
  const navigate = useNavigate();
  const [currentCardOrder, setCurrentCardOrder] = useState([
    "CardTotalProducts",
    "CardTotalPendingOrders",
    "CardTotalPendingPayment",
    "CardTotalCustomerOrder",
    "CardTotalCustomers",
    "CardTotalDelivery",
    "CardTotalLogs",
    "CardTotalSupplierOrder",
    "CardTotalReturns",
    "CardTotalSuppliers",
    "CardTotalTransactions",
    "CardTotalUsers",
  ]);

  const [tableOrder, setTableOrder] = useState([
    "ExpiredItemsAlert",
    "LowestStocks",
  ]);

  const cardOnClickHandlers = {
    CardTotalProducts: () => navigate("/admin/products"),
    CardTotalPendingOrders: () => navigate("/admin/customer-order"),
    CardTotalPendingPayment: () => navigate("/admin/customer-order"),
    CardTotalInventoryValue: () => navigate("/admin/inventory"),
    CardTotalCustomerOrder: () => navigate("/admin/customer-order"),
    CardTotalCustomers: () => navigate("/admin/customers"),
    CardTotalDelivery: () => navigate("/admin/delivery"),
    CardTotalLogs: () => navigate("/admin/logs"),
    CardTotalSupplierOrder: () => navigate("/admin/purchase-order"),
    CardTotalReturns: () => navigate("/admin/issues"),
    CardTotalSuppliers: () => navigate("/admin/suppliers"),
    CardTotalTransactions: () => navigate("/admin/reports"),
    CardTotalUsers: () => navigate("/admin/users"),
    CardTotalSales: () => navigate("/admin/sales"),
  };

  const tableOnClickHandlers = {
    ExpiredItemsAlert: () => navigate("/admin/inventory"),
    LowestStocks: () => navigate("/admin/inventory"),
  };

  const cardComponents = {
    CardTotalSales: <CardTotalSales />,
    CardTotalProducts: <CardTotalProducts />,
    CardTotalPendingOrders: <CardTotalPendingOrders />,
    CardTotalPendingPayment: <CardTotalPendingPayment />,
    CardTotalInventoryValue: <CardTotalInventoryValue />,
    CardTotalCustomerOrder: <CardTotalCustomerOrder />,
    CardTotalCustomers: <CardTotalCustomers />,
    CardTotalDelivery: <CardTotalDelivery />,
    CardTotalLogs: <CardTotalLogs />,
    CardTotalSupplierOrder: <CardTotalSupplierOrder />,
    CardTotalReturns: <CardTotalReturns />,
    CardTotalSuppliers: <CardTotalSuppliers />,
    CardTotalTransactions: <CardTotalTransactions />,
    CardTotalUsers: <CardTotalUsers />,
  };

  const tableComponents = {
    ExpiredItemsAlert: <ExpiredItemsAlert />,
    LowestStocks: <LowestStocks />,
  };

  return (
    <MainLayout>
      <CardContainer>
        {currentCardOrder.map((cardKey) => {
          if (cardComponents[cardKey]) {
            return (
              <CardWrapper key={cardKey} onClick={cardOnClickHandlers[cardKey]}>
                {cardComponents[cardKey]}
              </CardWrapper>
            );
          }
          return null;
        })}
      </CardContainer>

      <ScrollableTablesContainer>
        <TablesContainer>
          {tableOrder.map((tableKey) => {
            if (tableComponents[tableKey]) {
              return (
                <Row key={tableKey} onClick={tableOnClickHandlers[tableKey]}>
                  {tableComponents[tableKey]}
                </Row>
              );
            }
            return null;
          })}
        </TablesContainer>
      </ScrollableTablesContainer>

      <RevenueGraph />
    </MainLayout>
  );
};

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0 auto;
  gap: 1rem;
  width: 100%;
`;

const CardWrapper = styled.div`
  cursor: pointer;
`;

const ScrollableTablesContainer = styled.div`
  overflow-x: auto;
  margin: 2rem auto;
  width: 100%;
  padding: 7px;
`;

const TablesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 488px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  cursor: pointer;
`;

export default SuperAdminDashboard;
