import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import DashboardTable from "./DashboardTable";
import { fetchProductList } from "../../api/ProductApi";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const ExpiredItemsAlert = () => {
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [isSortedByExpiryAsc, setIsSortedByExpiryAsc] = useState(true);

  // Fetch expired products and product list
  const fetchExpiringProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8000/inventory/expiredsoon/");
      setExpiringProducts(response.data);
    } catch (err) {
      setError("Error fetching expiring products.");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { results } = await fetchProductList(1, 20, "");
      setProductsList(results);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchExpiringProducts();
      await loadProducts();
    };
    fetchData();
  }, []);

  const getSupplierForProduct = (productName) => {
    const product = productsList.find((prod) => prod.PROD_NAME === productName);
    return product ? product.PROD_DETAILS.PROD_DETAILS_SUPPLIER : "N/A";
  };

  const toggleExpiryDateSort = () => {
    setIsSortedByExpiryAsc(!isSortedByExpiryAsc);
  };

  const sortedExpiringProducts = isSortedByExpiryAsc
    ? expiringProducts.sort((a, b) => new Date(a.EXPIRY_DATE) - new Date(b.EXPIRY_DATE))
    : expiringProducts.sort((a, b) => new Date(b.EXPIRY_DATE) - new Date(a.EXPIRY_DATE));

  const limitedData = sortedExpiringProducts.slice(0, 10); // Limit to 10 rows

  const headers = [
    "Product Name",
    "Supplier Name",
    "Quantity",
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // Center content horizontally
        gap: "5px", // Add space between the text and chevron
        color: "white",
        width: "100%", // Ensure the content spans fully
      }}
    >
      Expiry Date
      <ToggleSortButton onClick={toggleExpiryDateSort}>
        {isSortedByExpiryAsc ? <FaChevronUp /> : <FaChevronDown />}
      </ToggleSortButton>
    </div>,
  ];
  

  const data = limitedData.map(({ PRODUCT_NAME, QUANTITY_ON_HAND, EXPIRY_DATE }) => [
    PRODUCT_NAME,
    getSupplierForProduct(PRODUCT_NAME),
    QUANTITY_ON_HAND,
    new Date(EXPIRY_DATE).toLocaleDateString(),
  ]);

  if (loading) return <p>Loading expiring products...</p>;
  if (error) return <p>{error}</p>;

  return (
    <ModalWrapper>
      <DashboardTable
        title="Expiring Soon"
        headers={headers}
        data={data}
        onRowClick={(id) => (window.location.href = `/staff/inventory/${id}`)}
      />
    </ModalWrapper>
  );
};

// Styled Components
const ModalWrapper = styled.div`
  width: 100%;
  background-color: #f8f9fa;
`;

const ToggleSortButton = styled.button`
  background-color: transparent;
  color: white;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  display: flex;
  align-items: center;

  svg {
    margin-left: 5px;
  }
`;

export default ExpiredItemsAlert;
