"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit"; // ←追加

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
  deals_customer_id_fkey: Customer | null;
  deals_product_id_fkey: Product | null;
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

  // ===== データ取得 =====
  const fetchAll = async () => {
    const { data: customersData } = await supabase
      .from("customers")
      .select("id, company_name");

    const { data: productsData } = await supabase
      .from("products")
      .select("id, product_name");

    const { data: dealsData } = await supabase
      .from("deals")
      .select(`
        id,
        deal_name,
        deals_customer_id_fkey ( id, company_name ),
        deals_product_id_fkey ( id, product_name )
      `)
      .order("created_at", { ascending: false });

    const mappedDeals: DealRow[] = (dealsData ?? []).map((d: any) => ({
      id: d.id,
      deal_name: d.deal_name,
      deals_customer_id_fkey: d.deals_customer_id_fkey ?? null, // ←修正
      deals_product_id_fkey: d.deals_product_id_fkey ?? null,     // ←修正
    }));

    setCustomers(customersData ?? []);
    setProducts(productsData ?? []);
    setDeals(mappedDeals);
  };

  // ===== 案件追加 =====
  const addDeal = async () => {
    if (!dealName || !customerId || !productId) {
      alert("すべて入力してください");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("deals").insert({
      deal_name: dealName,
      customer_id: customerId,
      product_id: productId,
      user_id: user.id,
    });

    if (!error) {
      setDealName("");
      setCustomerId("");
      setProductId("");
      fetchAll();
    }
  };

  // ===== PDF生成 =====
  const generatePDF = async (deal: DealRow) => {
    const pdfDoc = await PDFDocument.create();

    // fontkit を登録
    pdfDoc.registerFontkit(fontkit);

    // フォント読み込み
    const fontBytes = await fetch("/fonts/NotoSansJP-Regular.ttf").then((res) =>
      res.arrayBuffer()
    );
    const customFont = await pdfDoc.embedFont(fontBytes);

    const page = pdfDoc.addPage([595, 842]);
    const { height } = page.getSize();
    let y = height - 80;

    const drawText = (text: string) => {
      page.drawText(text, {
        x: 60,
        y,
        size: 14,
        font: customFont,
        color: rgb(0, 0, 0),
      });
      y -= 28;
    };

    drawText("案件情報");
    drawText(`案件名：${deal.deal_name}`);
    drawText(`顧客名：${deal.deals_customer_id_fkey?.company_name ?? "-"}`);
    drawText(`商品名：${deal.deals_product_id_fkey?.product_name ?? "-"}`);

    const pdfBytes = (await pdfDoc.save()) as Uint8Array; // ←型キャスト
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  // ===== 案件削除 =====
  const deleteDeal = async (id: string) => {
    await supabase.from("deals").delete().eq("id", id);
    fetchAll();
  };

  return (
    <div style={{ padding: 0 }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>案件管理</h1>

      {/* 新規案件 */}
      <div style={cardStyle}>
        <input
          placeholder="案件名"
          value={dealName}
          onChange={(e) => setDealName(e.target.value)}
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

      {/* 案件一覧 */}
      <ul>
        {deals.map((d) => (
          <li key={d.id} style={listStyle}>
            <div>
              <strong>{d.deal_name}</strong>
              <div style={smallText}>
                顧客：{d.deals_customer_id_fkey?.company_name ?? "-"}
              </div>
              <div style={smallText}>
                商品：{d.deals_product_id_fkey?.product_name ?? "-"}
              </div>
            </div>

            <div>
              <button
                onClick={() => generatePDF(d)}
                style={{ ...buttonStyle, marginRight: 8 }}
              >
                PDF
              </button>
              <button
                onClick={() => deleteDeal(d.id)}
                style={deleteButtonStyle}
              >
                削除
              </button>
            </div>
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
