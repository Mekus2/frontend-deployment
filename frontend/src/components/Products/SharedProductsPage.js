import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProductList } from "../../api/ProductApi";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table_Pagination";
import CardTotalProducts from "../CardsData/CardTotalProducts";
//import CardTotalCategories from "../CardsData/CardTotalCategories";
import Button from "../Layout/Button";
import AddProductModal from "./AddProductModal";
import ProductDetailsModal from "./ProductDetailsModal";
import { FaPlus } from "react-icons/fa";
import { colors } from "../../colors";
import { fetchCategory } from "../../api/CategoryApi";
import axios from "axios";

const SharedProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isProductDetailsModalOpen, setIsProductDetailsModalOpen] =
    useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const itemsPerPage = 20; // Set how many items per page
  const [totalRows, setTotalRows] = useState(0); // Track the total rows for pagination

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadProductsAndCategories = async () => {
      try {
        // Fetch products with pagination and searchTerm
        const { results, count } = await fetchProductList(
          currentPage, // Current page
          itemsPerPage, // Number of items per page
          searchTerm // Search term for filtering
        );

        // Set products and total rows for pagination
        setProducts(results);
        setTotalRows(count);

        // Get unique category codes
        const uncachedCategoryCodes = [
          ...new Set(
            results.map((product) => product.PROD_DETAILS["PROD_CAT_CODE"])
          ),
        ];

        const uncachedCategories =
          uncachedCategoryCodes.length > 0
            ? await Promise.all(uncachedCategoryCodes.map(fetchCategory))
            : [];

        // Map products to rows
        const rowsData = results.map((product) => {
          const productDetail = product.PROD_DETAILS;
          const category = uncachedCategories.find(
            (cat) => cat.PROD_CAT_CODE === productDetail.PROD_CAT_CODE
          );
        
          const unit = productDetail.PROD_DETAILS_UNIT || "N/A";
          const brand = product.PROD_BRAND|| "N/A";
          const price = parseFloat(productDetail.PROD_DETAILS_PRICE);
        
          // Combine brand and product name
          const productName = `${product.PROD_BRAND || ""} ${product.PROD_NAME}`.trim();
        
          return [
            productName, // Updated to include combined brand and name
            category ? category.PROD_CAT_NAME : "N/A",
            unit,
            brand,
            price && !isNaN(price) ? `₱${price.toFixed(2)}` : "₱0.00",
            <ActionButton
              key="action"
              fontSize="14px"
              onClick={() => openProductDetailsModal(product)}
            >
              Details
            </ActionButton>,
          ];
        });

        setRows(rowsData);
        setLoading(false);
      } catch (err) {
        setError("Error fetching products or categories");
        setLoading(false);
      }
    };

    loadProductsAndCategories();
  }, [searchTerm, currentPage]); // Re-run if searchTerm or currentPage changes

  const openAddProductModal = () => setIsAddProductModalOpen(true);
  const closeAddProductModal = () => setIsAddProductModalOpen(false);

  const openProductDetailsModal = async (product) => {
    try {
      // Ensure product.id is a valid number or string
      const productResponse = await axios.get(
        `http://127.0.0.1:8000/items/productList/${product.id}`
      );
      console.log("Product API Response:", productResponse.data); // Log the product data

      // Set only the product ID into state
      setSelectedProductId(product.id);

      // Open the modal with the selected product ID
      setIsProductDetailsModalOpen(true);
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };


  const closeProductDetailsModal = () => {
    setSelectedProductId(null);
    setIsProductDetailsModalOpen(false);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
};

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const headers = [ 
    "Product Name",
    "Category",
    "Unit",
    "Supplier",
    "Price",
    "Actions",
  ];

  return (
    <>
      <AnalyticsContainer>
        <CardTotalProducts />
        {/* <ClickableCard onClick={handleCardClick} /> */}
      </AnalyticsContainer>
      <Controls>
        <SearchBar
          placeholder="Search / Filter product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Controls>

      {/* Pass props to the Table component */}
      <Table
        headers={headers}
        rows={rows}
        rowsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalRows={totalRows}
        onPageChange={handlePageChange}
      />

      {isAddProductModalOpen && (
        <AddProductModal onClose={closeAddProductModal} />
      )}
      {isProductDetailsModalOpen && selectedProductId && (
        <ProductDetailsModal
          productId={selectedProductId}
          onClose={closeProductDetailsModal}
        />
      )}
    </>
  );
};

// Styled components
const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 1px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
`;

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;

  .icon {
    font-size: 20px;
    margin-right: 8px;
  }
`;

const AnalyticsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 0 1px;
`;

const ClickableCard = styled.div`
  cursor: pointer;
`;

const ActionButton = styled(Button)`
  background-color: ${colors.primary};
  &:hover {
    background-color: ${colors.primaryHover};
  }

  .icon {
    font-size: 20px;
    margin-right: 8px;
  }
`;

export default SharedProductsPage;
