"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ===== 型定義 ===== */
type Customer = {
  id: string;
  company_name: string;
};

type Product = {
  id: string;
  product_name: string;
};

type DealRow = {
  id: string;
  deal_name: string;
  deals_customer_id_fkey: {
    id: string;
    company_name: string;
  }[] | null;
  deals_product_id_fkey: {
    id: string;
    product_name: string;
  }[] | null;
};

export default function DealsPage() {
  const [dealName, setDealName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<DealRow[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  /* ===== データ取得 ===== */
const fetchAll = async () => {
  const { data: customersData } = await supabase
    .from("customers")
    .select("id, company_name");

  const { data: productsData } = await supabase
    .from("products")
    .select("id, product_name");

  const { data: dealsData, error } = await supabase
    .from("deals")
    .select(`
      id,
      deal_name,
      deals_customer_id_fkey ( id, company_name ),
      deals_product_id_fkey ( id, product_name )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  setCustomers(customersData ?? []);
  setProducts(productsData ?? []);
  setDeals(dealsData ?? []);
};

  /* ===== 案件追加 ===== */
  const addDeal = async () => {
    if (!dealName || !customerId || !productId) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("deals").insert({
      deal_name: dealName,
      customer_id: customerId,
      product_id: productId,
      user_id: user.id,
    });

    setDealName("");
    setCustomerId("");
    setProductId("");
    fetchAll();
  };

  /* ===== 削除 ===== */
  const deleteDeal = async (id: string) => {
    await supabase.from("deals").delete().eq("id", id);
    fetchAll();
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>案件管理</h1>

      {/* 新規作成 */}
      <div style={cardStyle}>
        <input
          value={dealName}
          onChange={(e) => setDealName(e.target.value)}
          placeholder="案件名"
          style={inputStyle}
        />

        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          style={inputStyle}
        >
          <option value="">顧客を選択</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.company_name}
            </option>
          ))}
        </select>

        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          style={inputStyle}
        >
          <option value="">商品を選択</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.product_name}
            </option>
          ))}
        </select>

        <button onClick={addDeal} style={buttonStyle}>
          保存
        </button>
      </div>

      {/* 一覧 */}
      <ul>
        {deals.map((d) => (
          <li key={d.id} style={listStyle}>
            <div>
              <strong>{d.deal_name}</strong>
              <div style={smallText}>
                顧客：{d.deals_customer_id_fkey?.[0]?.company_name ?? "-"}
              </div>
              <div style={smallText}>
                商品：{d.deals_product_id_fkey?.[0]?.product_name ?? "-"}
              </div>
            </div>

            <button onClick={() => deleteDeal(d.id)} style={deleteButtonStyle}>
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ===== Styles ===== */
const cardStyle = {
  background: "#fff",
  padding: 16,
  borderRadius: 8,
  marginBottom: 24,
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: 8,
  marginBottom: 8,
};

const buttonStyle = {
  padding: "8px 16px",
  backgroundColor: "#22c55e",
  color: "#fff",
  border: "none",
  borderRadius: 6,
};

const deleteButtonStyle = {
  backgroundColor: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: 6,
};

const listStyle = {
  background: "#fff",
  padding: 12,
  borderRadius: 8,
  marginBottom: 8,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const smallText = {
  fontSize: 12,
  color: "#666",
};
