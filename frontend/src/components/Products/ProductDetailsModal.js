import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import Modal from "../Layout/Modal";
import Button from "../Layout/Button";
import { colors } from "../../colors";
import { FaTimes } from "react-icons/fa";
import { notify } from "../Layout/CustomToast";

const ProductDetailsModal = ({ productId, onClose }) => {
  const [product, setProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({});
  const [showPriceHistory, setShowPriceHistory] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/items/productList/${productId}/`
        );
        const data = response.data;
        setProduct(data);
        setEditFields({
          PROD_BRAND: data.PROD_BRAND || "",
          PROD_NAME: data.PROD_NAME || "",
          PROD_RO_LEVEL: data.PROD_RO_LEVEL || "",
          PROD_RO_QTY: data.PROD_RO_QTY || "",
          PROD_QOH: data.PROD_QOH || "",
          PROD_DETAILS_DESCRIPTION: data.PROD_DETAILS?.PROD_DETAILS_DESCRIPTION || "",
          PROD_DETAILS_PRICE: data.PROD_DETAILS?.PROD_DETAILS_PRICE || "",
          PROD_DETAILS_PURCHASE_PRICE: data.PROD_DETAILS?.PROD_DETAILS_PURCHASE_PRICE || "",
          PROD_DETAILS_UNITS: data.PROD_DETAILS?.PROD_DETAILS_UNITS || "",
          categories: data.PROD_CATEGORIES || [],
        });
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleEdit = () => setIsEditing(true);
  const handleInputChange = (field, value) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const updatedProduct = {
        ...product,
        PROD_BRAND: editFields.PROD_BRAND,
        PROD_NAME: editFields.PROD_NAME,
        PROD_RO_LEVEL: editFields.PROD_RO_LEVEL,
        PROD_RO_QTY: editFields.PROD_RO_QTY,
        PROD_QOH: editFields.PROD_QOH,
        PROD_DETAILS: {
          PROD_DETAILS_DESCRIPTION: editFields.PROD_DETAILS_DESCRIPTION,
          PROD_DETAILS_PRICE: editFields.PROD_DETAILS_PRICE,
          PROD_DETAILS_PURCHASE_PRICE: editFields.PROD_DETAILS_PURCHASE_PRICE,
          PROD_DETAILS_UNITS: editFields.PROD_DETAILS_UNITS,
        },
        PROD_CATEGORIES: editFields.categories,
      };
      await axios.put(
        `http://localhost:8000/items/productList/${productId}/`,
        updatedProduct
      );
      notify.success("Product updated successfully!");
      setProduct(updatedProduct);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating product data:", error);
    }
  };

  const productDetail = product?.PROD_DETAILS;

  if (!product) return <p>Loading...</p>;

  return (
    <Modal
      title={isEditing ? `Edit ${product.PROD_NAME}` : `${product.PROD_NAME} Details`}
      onClose={onClose}
    >
      {isEditing ? (
        <Details>
          <DetailItem>
            <Label>Brand:</Label>
            <Input
              value={editFields.PROD_BRAND}
              onChange={(e) => handleInputChange("PROD_BRAND", e.target.value)}
            />
          </DetailItem>
          <DetailItem>
            <Label>Name:</Label>
            <Input
              value={editFields.PROD_NAME}
              onChange={(e) => handleInputChange("PROD_NAME", e.target.value)}
            />
          </DetailItem>
          <DetailItem>
            <Label>Category:</Label>
            <Input
              value={editFields.categories.join(", ")}
              onChange={(e) => handleInputChange("categories", e.target.value.split(", "))}
            />
          </DetailItem>
          <DetailItem>
            <Label>Units:</Label>
            <Input
              value={editFields.PROD_DETAILS_UNITS}
              onChange={(e) =>
                handleInputChange("PROD_DETAILS_UNITS", e.target.value)
              }
            />
          </DetailItem>
          <DetailItem>
            <Label>Purchase Price:</Label>
            <Input
              value={editFields.PROD_DETAILS_PURCHASE_PRICE}
              onChange={(e) =>
                handleInputChange("PROD_DETAILS_PURCHASE_PRICE", e.target.value)
              }
            />
          </DetailItem>
          <DetailItem>
            <Label>Price:</Label>
            <Input
              type="number"
              value={editFields.PROD_DETAILS_PRICE}
              onChange={(e) =>
                handleInputChange("PROD_DETAILS_PRICE", e.target.value)
              }
            />
          </DetailItem>
          <DetailItem>
            <Label>Description:</Label>
            <TextArea
              value={editFields.PROD_DETAILS_DESCRIPTION}
              onChange={(e) =>
                handleInputChange("PROD_DETAILS_DESCRIPTION", e.target.value)
              }
            />
          </DetailItem>
          <DetailItem>
            <Label>Reorder Level:</Label>
            <Input
              type="number"
              value={editFields.PROD_RO_LEVEL}
              onChange={(e) =>
                handleInputChange("PROD_RO_LEVEL", e.target.value)
              }
            />
          </DetailItem>
          <DetailItem>
            <Label>Reorder Quantity:</Label>
            <Input
              type="number"
              value={editFields.PROD_RO_QTY}
              onChange={(e) =>
                handleInputChange("PROD_RO_QTY", e.target.value)
              }
            />
          </DetailItem>
          <DetailItem>
            <Label>Quantity on Hand:</Label>
            <Input
              type="number"
              value={editFields.PROD_QOH}
              onChange={(e) =>
                handleInputChange("PROD_QOH", e.target.value)
              }
            />
          </DetailItem>
        </Details>
      ) : (
        <Details>
          <Detail>
            <DetailLabel>Brand:</DetailLabel> {product.PROD_BRAND}
          </Detail>
          <Detail>
            <DetailLabel>Name:</DetailLabel> {product.PROD_NAME}
          </Detail>
          <Detail>
            <DetailLabel>Category:</DetailLabel>{" "}
            {product.PROD_CATEGORIES?.join(", ")}
          </Detail>
          <Detail>
            <DetailLabel>Units:</DetailLabel> {productDetail?.PROD_DETAILS_UNITS}
          </Detail>
          <Detail>
            <DetailLabel>Purchase Price:</DetailLabel> ₱
            {productDetail?.PROD_DETAILS_PURCHASE_PRICE}
          </Detail>
          <Detail>
            <DetailLabel>Price:</DetailLabel> ₱
            {productDetail?.PROD_DETAILS_PRICE}
          </Detail>
          <Detail>
            <DetailLabel>Description:</DetailLabel>{" "}
            {productDetail?.PROD_DETAILS_DESCRIPTION}
          </Detail>
          <Detail>
            <DetailLabel>Reorder Level:</DetailLabel> {product.PROD_RO_LEVEL}
          </Detail>
          <Detail>
            <DetailLabel>Reorder Quantity:</DetailLabel> {product.PROD_RO_QTY}
          </Detail>
          <Detail>
            <DetailLabel>Quantity on Hand:</DetailLabel> {product.PROD_QOH}
          </Detail>
        </Details>
      )}
      <ButtonGroup>
        {isEditing ? (
          <>
            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
            <Button variant="red" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button variant="red">
              Remove
            </Button>
            <Button variant="primary" onClick={handleEdit}>
              Edit
            </Button>
          </>
        )}
      </ButtonGroup>
    </Modal>
  );
};

const CategoriesInput = ({ value, onChange }) => {
  const [newTag, setNewTag] = useState("");

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && newTag.trim()) {
      e.preventDefault();
      const updatedCategories = [...value, newTag.trim()];
      onChange(updatedCategories);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedCategories = value.filter((tag) => tag !== tagToRemove);
    onChange(updatedCategories);
  };

  const handleBlur = () => {
    if (newTag.trim()) {
      const updatedCategories = [...value, newTag.trim()];
      onChange(updatedCategories);
      setNewTag("");
    }
  };

  return (
    <>
      <TagInput
        type="text"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Add a Category"
      />
      <TagList>
        {value.map((tag, index) => (
          <Tag key={index}>
            {tag}
            <CloseIcon onClick={() => handleRemoveTag(tag)} />
          </Tag>
        ))}
      </TagList>
    </>
  );
};

// Styled Components
const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
`;

const Tag = styled.span`
  background-color: ${colors.primary}; /* Primary color */
  color: white; /* White text */
  padding: 6px 12px;
  border-radius: 15px;
  margin: 5px;
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: bold;
`;

const CloseIcon = styled(FaTimes)`
  margin-left: 8px;
  cursor: pointer;
  font-size: 1rem;
  color: ${colors.red};
  &:hover {
    color: ${colors.darkRed};
  }
`;

const TagInput = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 0.875rem;
  margin-top: 10px;
  margin-bottom: 5px;
`;

const ImagePreview = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
`;
const Details = styled.div`
  margin-bottom: 20px;
`;

const Detail = styled.div`
  margin-bottom: 10px;
`;

const DetailLabel = styled.span`
  font-weight: bold;
  margin-right: 10px;
`;

const DetailItem = styled.div`
  margin-bottom: 10px;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const MoreInfoButton = styled(Button)`
  margin-left: 10px;
`;

export default ProductDetailsModal;
