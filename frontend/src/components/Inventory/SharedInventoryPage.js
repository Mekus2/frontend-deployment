import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
import InventoryDetailsModal from "../Inventory/InventoryDetailsModal";
import axios from "axios";
import Button from "../Layout/Button";
import { fetchProductList } from "../../api/ProductApi"; // Import fetchProductList API
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Import Chevron icons

const SharedInventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inventoryData, setInventoryData] = useState([]); // State to store inventory data
  const [loading, setLoading] = useState(false); // State to handle loading
  const [error, setError] = useState(null); // State to handle errors
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [totalRows, setTotalRows] = useState(0); // Total rows from the backend
  const [productsList, setProductsList] = useState([]); // State to hold product list with supplier info
  const [isSortedByExpiryAsc, setIsSortedByExpiryAsc] = useState(true); // Toggle for sorting expiry dates
  const [startDate, setStartDate] = useState(""); // Start date for expiry filter
  const [endDate, setEndDate] = useState(""); // End date for expiry filter

  const rowsPerPage = 20; // Items per page

  // Fetch product list with supplier info
  const loadProducts = async () => {
    try {
      const { results } = await fetchProductList(currentPage, rowsPerPage, searchTerm); // Fetch product list
      setProductsList(results); // Store fetched products
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  // Fetch inventory data
  const fetchInventory = async () => {
    setLoading(true); // Start loading
    setError(null); // Reset error state
    try {
      const url = searchTerm
        ? `http://localhost:8000/inventory/search/?PRODUCT_NAME=${searchTerm}&page=${currentPage}&page_size=${rowsPerPage}`
        : `http://localhost:8000/inventory/list/?page=${currentPage}&page_size=${rowsPerPage}`;
      const response = await axios.get(url);

      // Assuming the backend sends pagination metadata
      const { results, count } = response.data;
      setInventoryData(results); // Store fetched inventory data
      setTotalRows(count); // Update total rows
      await loadProducts(); // Fetch products list with supplier info
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      setError("Inventory data not found.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchInventory(); // Call fetchInventory when component mounts or dependencies change
  }, [searchTerm, currentPage]); // Re-run whenever searchTerm or currentPage changes

  const handleDetailClick = async (item) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/inventory/list/${item.INVENTORY_ID}/`
      );
      setSelectedItem(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching inventory details:", error);
    }
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  // Function to find the supplier for a product based on product name
  const getSupplierForProduct = (productName) => {
    const product = productsList.find((prod) => prod.PROD_NAME === productName);
    return product ? product.PROD_DETAILS.PROD_DETAILS_SUPPLIER : "N/A"; // Return the supplier or "N/A" if not found
  };

  // Function to toggle sorting of expiry dates
  const toggleExpiryDateSort = () => {
    setIsSortedByExpiryAsc(!isSortedByExpiryAsc);
  };

  // Function to handle date range filtering
  const handleDateFilterChange = () => {
    if (startDate && endDate) {
      const filteredData = inventoryData.filter((item) => {
        const expiryDate = new Date(item.EXPIRY_DATE);
        return expiryDate >= new Date(startDate) && expiryDate <= new Date(endDate);
      });
      setInventoryData(filteredData); // Filter the inventory data
    } else {
      fetchInventory(); // Re-fetch the full inventory data if no dates are provided
    }
  };

  // Sort inventory data by expiry date
  const sortedInventoryData = isSortedByExpiryAsc
    ? inventoryData.sort((a, b) => new Date(a.EXPIRY_DATE) - new Date(b.EXPIRY_DATE)) // Ascending
    : inventoryData.sort((a, b) => new Date(b.EXPIRY_DATE) - new Date(a.EXPIRY_DATE)); // Descending

    const headers = [
      "Name",
      "Batch No",
      "Quantity on Hand",
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center", // Center content horizontally
          gap: "5px", // Add space between the text and chevron
          color: "white", // Set text and chevron color to white
        }}
      >
        Expiry Date
        <ToggleSortButton onClick={toggleExpiryDateSort} style={{ color: "white" }}>
          {isSortedByExpiryAsc ? <FaChevronUp /> : <FaChevronDown />}
        </ToggleSortButton>
      </div>,
      "Supplier Name",
      "Action",
    ];
    

  const rows = sortedInventoryData.map((item) => [
    item.PRODUCT_NAME,
    item.BATCH_ID,
    item.QUANTITY_ON_HAND,
    new Date(item.EXPIRY_DATE).toLocaleDateString(),
    getSupplierForProduct(item.PRODUCT_NAME), // Get the supplier for each product
    <Button onClick={() => handleDetailClick(item)}>Details</Button>,
  ]);

  return (
    <>
      <Controls>
        <SearchBar
          placeholder="Search / Filter inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div>
          <DateRangeContainer>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button onClick={handleDateFilterChange}>Filter by Date Range</Button>
          </DateRangeContainer>
        </div>
      </Controls>
      {loading ? (
        <p>Loading inventory...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <Table
          headers={headers}
          rows={rows}
          rowsPerPage={rowsPerPage}
          currentPage={currentPage}
          totalRows={totalRows}
          onPageChange={setCurrentPage} // Update the current page
        />
      )}
      {showDetailModal && selectedItem && (
        <InventoryDetailsModal item={selectedItem} onClose={closeModal} />
      )}
    </>
  );
};

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 1px;
`;

const DateRangeContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Input = styled.input`
  padding: 8px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const ToggleSortButton = styled.button`
  background-color: transparent;
  color: #007bff;
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

export default SharedInventoryPage;
