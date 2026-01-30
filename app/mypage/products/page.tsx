"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  product_name: string;
  quantity: number;
};

export default function ProductsPage() {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
  };

  const addProduct = async () => {
    if (!productName || quantity <= 0) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("products").insert({
      product_name: productName,
      quantity,
      user_id: user.id,
    });

    setProductName("");
    setQuantity(1);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  return (
    <div>
      <h1 style={{ fontSize: "20px", marginBottom: "16px" }}>商品管理</h1>

      {/* 入力フォーム */}
      <div
        style={{
          background: "#fff",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      >
        <input
          placeholder="商品名"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          style={inputStyle}
        />

        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          style={inputStyle}
        />

        <button onClick={addProduct} style={buttonStyle}>
          保存
        </button>
      </div>

      {/* 商品一覧 */}
      <ul>
        {products.map((p) => (
          <li
            key={p.id}
            style={{
              background: "#fff",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <strong>{p.product_name}</strong>
              <div style={{ fontSize: "12px", color: "#666" }}>
                個数：{p.quantity}
              </div>
            </div>

            <button
              onClick={() => deleteProduct(p.id)}
              style={deleteButtonStyle}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "8px",
  marginBottom: "8px",
};

const buttonStyle = {
  padding: "8px 16px",
  backgroundColor: "#22c55e",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
};

const deleteButtonStyle = {
  backgroundColor: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
};
