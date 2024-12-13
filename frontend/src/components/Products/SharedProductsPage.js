import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProductList } from "../../api/ProductApi";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10; // Number of items per page

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadProductsAndCategories = async () => {
      try {
        // Fetch products
        const response = await fetchProductList(currentPage, itemsPerPage); // Make sure to pass pagination params
        const fetchedProducts = response.results;
        const total = response.total; // Assuming the API returns a total count of products
        const totalPages = Math.ceil(total / itemsPerPage);

        setTotalPages(totalPages);
        setProducts(fetchedProducts);

        // Filter products based on search term
        const filteredProducts = fetchedProducts.filter((product) =>
          product.PROD_NAME.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Get unique category codes
        const uncachedCategoryCodes = [
          ...new Set(
            filteredProducts.map(
              (product) => product.PROD_DETAILS["PROD_CAT_CODE"]
            )
          ),
        ];

        // Fetch categories if uncached codes are found
        const uncachedCategories =
          uncachedCategoryCodes.length > 0
            ? await Promise.all(uncachedCategoryCodes.map(fetchCategory))
            : [];

        // Map products to rows
        const rowsData = filteredProducts.map((product) => {
          const productDetail = product.PROD_DETAILS;
          const category = uncachedCategories.find(
            (cat) => cat.PROD_CAT_CODE === productDetail.PROD_CAT_CODE
          );

          const unit = productDetail.PROD_DETAILS_UNIT || "N/A";
          const brand = productDetail.PROD_DETAILS_SUPPLIER || "N/A";
          const price = parseFloat(productDetail.PROD_DETAILS_PRICE);

          return [
            product.PROD_NAME,
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
      const productResponse = await axios.get(
        `https://backend-deployment-production-92b6.up.railway.app/items/productList/${product.id}`
      );
      console.log("Product API Response:", productResponse.data);
      setSelectedProductId(product.id);
      setIsProductDetailsModalOpen(true);
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };

  const closeProductDetailsModal = () => {
    setSelectedProductId(null);
    setIsProductDetailsModalOpen(false);
  };

  const handleCardClick = () => {
    let path;
    if (location.pathname.includes("/superadmin")) {
      path = "/admin/categories";
    } else if (location.pathname.includes("/admin")) {
      path = "/staff/categories";
    } else if (location.pathname.includes("/staff")) {
      path = "/prevstaff/categories";
    } else {
      alert("Access denied");
      return;
    }
    navigate(path);
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
        <ClickableCard onClick={handleCardClick} />
      </AnalyticsContainer>
      <Controls>
        <SearchBar
          placeholder="Search / Filter product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Controls>
      <Table headers={headers} rows={rows} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
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
