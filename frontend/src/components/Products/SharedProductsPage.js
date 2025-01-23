import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { FaShoppingCart, FaDollarSign } from "react-icons/fa";
import Table from "../Layout/Table";
import SearchBar from "../Layout/SearchBar";
import Button from "../Layout/Button";
import ReportCard from "../Layout/ReportCard";

const AllOrderReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdated, setIsUpdated] = useState(false); // Tracks if the daily report has been updated

  // Fetch initial data on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [viewDailyResponse, currentStockResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8000//viewdaily/"),
          axios.get("http://127.0.0.1:8000/repreportort/current/"),
        ]);

        const combinedData = viewDailyResponse.data.map((daily) => {
          const currentStock =
            currentStockResponse.data.find(
              (current) => current.product_name === daily.product_name
            )?.current_stock || 0;

          return {
            id: daily.id, // Add an ID field if available
            product: daily.product_name,
            date: daily.date,
            openingStock: daily.opening_stock,
            currentStock: currentStock,
          };
        });

        setTableData(combinedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdate = async (id) => {
    try {
      setLoading(true);
      await axios.post(`http://127.0.0.1:8000/report/update/${id}/`); // Use the product ID for the update API
      alert("Row updated successfully.");
      // Optionally, fetch updated data
    } catch (error) {
      console.error("Error updating row:", error);
      alert("Failed to update the row.");
    } finally {
      setLoading(false);
    }
  };

  const header = [
    "Product",
    "Date",
    "Opening Stock",
    "Current Stock",
    "Actions",
  ];

  return (
    <>
      <CardsContainer>
        <ReportCard
          label="Total Products"
          value={`${tableData.length} Products`}
          startDate={startDate}
          endDate={endDate}
          icon={<FaShoppingCart />}
        />
        <ReportCard
          label="Order Value"
          value={`₱${tableData
            .reduce((acc, row) => acc + (row.gross || 0), 0)
            .toFixed(2)}`}
          startDate={startDate}
          endDate={endDate}
          icon={<FaDollarSign />}
        />
      </CardsContainer>

      <Controls>
        <SearchBar
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Controls>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ReportContent>
          <Table
            headers={header}
            rows={tableData.map((row) => [
              row.product,
              row.date,
              row.openingStock,
              row.currentStock,
              <Button
                variant="secondary"
                onClick={() => handleUpdate(row.id)} // Pass the ID for the update
              >
                Update
              </Button>,
            ])}
          />
        </ReportContent>
      )}
    </>
  );
};

// Styled Components
const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-bottom: 10px;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const ReportContent = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  min-height: 200px;
  text-align: center;
`;

export default AllOrderReport;
