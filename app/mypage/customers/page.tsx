"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: string;
  company_name: string;
  company_kana: string;
};

export default function CustomersPage() {
  const [companyName, setCompanyName] = useState("");
  const [companyKana, setCompanyKana] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCustomers(data);
    }
  };

  const addCustomer = async () => {
    if (!companyName || !companyKana) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("customers").insert({
      company_name: companyName,
      company_kana: companyKana,
      user_id: user.id,
    });

    setCompanyName("");
    setCompanyKana("");
    fetchCustomers();
  };

  const deleteCustomer = async (id: string) => {
    await supabase.from("customers").delete().eq("id", id);
    fetchCustomers();
  };

  return (
    <div>
      <h1 style={{ fontSize: "20px", marginBottom: "16px" }}>顧客管理</h1>

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
          placeholder="会社名"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="フリガナ"
          value={companyKana}
          onChange={(e) => setCompanyKana(e.target.value)}
          style={inputStyle}
        />
        <button onClick={addCustomer} style={buttonStyle}>
          保存
        </button>
      </div>

      {/* 顧客一覧 */}
      <ul>
        {customers.map((c) => (
          <li
            key={c.id}
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
              <strong>{c.company_name}</strong>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {c.company_kana}
              </div>
            </div>

            <button
              onClick={() => deleteCustomer(c.id)}
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
