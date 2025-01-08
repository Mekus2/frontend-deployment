// src/components/SuperAdminDashboard.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
//import HighestSellingProducts from "../../components/Dashboard/HighestSellingProducts";
//import RecentlyAddedProducts from "../../components/Dashboard/RecentlyAddedProducts";
import LowestStocks from "../../components/Dashboard/LowestStocks";
//import CardLowStocks from "../../components/CardsData/CardLowStocks";
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
import ExpiredItemsAlert from "../../components/Dashboard/ExpiredItemsAlert";
import { getLayout, saveLayout } from "../../utils/indexedDB";
import MainLayout from "../../components/Layout/MainLayout";
import Loading from "../../components/Layout/Loading";
import { checkUserAccess } from "../../api/authUtils";
import RevenueGraph from "../../components/Dashboard/RevenueGraph"; // Import the RevenueGraph component

const SuperAdminDashboard = () => {
  checkUserAccess();
  const navigate = useNavigate();
  const [currentCardOrder, setCurrentCardOrder] = useState([
    "CardTotalProducts",
    // "CardLowStocks",
    // "CardTotalInventoryValue",
    "CardTotalCustomerOrder",
    "CardTotalCustomers",
    "CardTotalDelivery",
    "CardTotalLogs",
    "CardTotalSupplierOrder",
    "CardTotalReturns",
    "CardTotalSuppliers",
    "CardTotalTransactions",
    "CardTotalUsers",
    // "CardTotalSales",
  ]);

  const [tableOrder, setTableOrder] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const loadLayout = async () => {
      setLoading(true); // Start loading
      try {
        const savedCardOrder = await getLayout("superadmin", "cardOrder");
        const savedTableOrder = await getLayout("superadmin", "tableOrder");

        if (savedCardOrder) {
          setCurrentCardOrder(savedCardOrder);
        }

        if (savedTableOrder) {
          setTableOrder(savedTableOrder);
        } else {
          setTableOrder([
            "HighestSellingProducts",
            "ExpiredItemsAlert",
            "RecentlyAddedProducts",
            "LowestStocks",
          ]);
        }
      } catch (error) {
        console.error("Error loading layout:", error);
      } finally {
        setLoading(false); // Ensure loading is stopped even if there's an error
      }
    };

    loadLayout();
  }, []);

  // Custom onClick handlers for cards (with superadmin role)
  const cardOnClickHandlers = {
    CardTotalProducts: () => navigate("/admin/products"),
    //CardLowStocks: () => navigate("/admin/inventory"),
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

  // Custom onClick handlers for tables (with superadmin role)
  const tableOnClickHandlers = {
    HighestSellingProducts: () => navigate("/admin/products"),
    ExpiredItemsAlert: () => navigate("/admin/inventory"),
    RecentlyAddedProducts: () => navigate("/admin/products"),
    LowestStocks: () => navigate("/admin/inventory"),
  };

  const cardComponents = {
    CardTotalSales: <CardTotalSales />,
    CardTotalProducts: <CardTotalProducts />,
    //  CardLowStocks: <CardLowStocks />,
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
    //HighestSellingProducts: <HighestSellingProducts />,
    // RecentlyAddedProducts: <RecentlyAddedProducts />,
    LowestStocks: <LowestStocks />,
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <MainLayout>
      <CardContainer>
        {currentCardOrder.map((cardKey, index) => {
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
          {tableOrder.map((tableKey, index) => {
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

      
      {/* Revenue Graph below Cards Section */}
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
