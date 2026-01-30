import Link from "next/link";
import "../globals.css";

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* サイドメニュー */}
      <aside
        style={{
          width: "220px",
          backgroundColor: "#1f2937",
          color: "#fff",
          padding: "20px",
        }}
      >
        <h2 style={{ marginBottom: "24px", fontSize: "18px" }}>
          ダッシュボード
        </h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link href="/mypage/customers" style={linkStyle}>
            顧客管理
          </Link>
          <Link href="/mypage/products" style={linkStyle}>
            商品管理
          </Link>
          <Link href="/mypage/deals" style={linkStyle}>
            案件管理
          </Link>
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <main
        style={{
          flex: 1,
          padding: "24px",
          backgroundColor: "#f9fafb",
        }}
      >
        {children}
      </main>
    </div>
  );
}

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  backgroundColor: "#374151",
};