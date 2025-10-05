import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import type { CartItem } from "@/context/CartContext";
import { getAllStocks, setStock, resetStocksRandom, setKidsAvailable, type SizeStock } from "@/data/stock";
import { getProducts, upsertProduct, deleteProduct, getCollections, addCollection, type CatalogProduct } from "@/data/catalog";
import { listOrders, updateOrderStatus, type OrderStatus } from "@/data/orders";
import { COLLECTIONS } from "@/data/products";
import { listAllUsers, type StoredUser } from "@/data/users";
import { readUserCart } from "@/data/carts";

const ALLOWED_ADMIN_EMAILS = new Set([
  "l1f22bscs1019@ucp.edu.pk",
  "itsmywork1019@gmail.com",
]);

export default function Admin() {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [pass, setPass] = useState("");
  const [stocks, setStocks] = useState<Record<string, SizeStock>>({});
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [orders, setOrders] = useState(listOrders());
  const [users, setUsers] = useState<StoredUser[]>(() => listAllUsers());
  const [userCarts, setUserCarts] = useState<Record<string, CartItem[]>>({});

  const loadUserCarts = useCallback((list: StoredUser[]) => {
    const mapped: Record<string, CartItem[]> = {};
    for (const u of list) {
      mapped[u.id] = readUserCart(u.id);
    }
    setUserCarts(mapped);
  }, []);

  const loadUsersAndCarts = useCallback(() => {
    const list = listAllUsers();
    setUsers(list);
    loadUserCarts(list);
  }, [loadUserCarts]);

  useEffect(() => {
    setStocks(getAllStocks());
    setCatalog(getProducts());
    setCollections(getCollections());
    setOrders(listOrders());
    loadUsersAndCarts();
  }, [loadUsersAndCarts]);

  useEffect(() => {
    console.log("🧠 Admin mounted | Current user:", user);
    const handleCartChange = (event: Event) => {
      const detail = (event as CustomEvent<{ userId: string }>).detail;
      if (detail?.userId) {
        setUserCarts((prev) => ({ ...prev, [detail.userId]: readUserCart(detail.userId) }));
      } else {
        loadUsersAndCarts();
      }
    };
    window.addEventListener("cart:change", handleCartChange);
    return () => window.removeEventListener("cart:change", handleCartChange);
  }, [loadUsersAndCarts]);

  if (!user) return <div className="container py-10">Please login to access admin.</div>;
  if (!ALLOWED_ADMIN_EMAILS.has(user.email)) return <div className="container py-10">You are not authorized to access admin.</div>;
  if (!unlocked) {
    return (
      <main className="container py-10 space-y-4">
        <h1 className="font-serif text-3xl">Admin Access</h1>
        <p className="text-sm text-muted-foreground">Enter admin password to continue.</p>
        <div className="flex items-center gap-2">
          <Input type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} className="w-48" onFocus={() => console.log("✳️ Password input focused")}/>
          <Button
            onClick={() => {
              if (pass.trim() === "4321") setUnlocked(true);
              else alert("Incorrect password");
            }}
          >
            Enter
          </Button>
        </div>
      </main>
    );
  }

  const setOneStock = (id: string, size: "S" | "M" | "L", qty: number) => {
    setStock(id, size, qty);
    setStocks((s) => ({
      ...s,
      [id]: { ...(s[id] ?? { S: 0, M: 0, L: 0, kids: false }), [size]: Math.max(0, Math.floor(qty)) },
    }));
  };

  const saveProduct = (p: CatalogProduct) => {
    upsertProduct(p);
    setCatalog(getProducts());
  };

  const addNewProduct = () => {
    const id = prompt("Product id (unique)")?.trim();
    if (!id) return;
    const name = prompt("Name")?.trim() || "New Product";
    const image = prompt("Image URL")?.trim() || "https://via.placeholder.com/600x400";
    const collectionIdx = Number(
      prompt(
        `Select collection:\n1) Eid Collection\n2) Bakra Eid Specials\n3) 14 August Independence Collection\n4) Birthday Specials\n\nEnter number 1-4:`
      )?.trim()
    );
    const collection = COLLECTIONS[
      Number.isFinite(collectionIdx) && collectionIdx >= 1 && collectionIdx <= COLLECTIONS.length
        ? collectionIdx - 1
        : 0
    ];
    const sizes = ["S", "M", "L", "Kids"];
    const priceBySize: Record<string, number> = { S: 5000, M: 5300, L: 5600, Kids: 4500 };
    const product: CatalogProduct = { id, name, description: "", image, sizes, collection, priceBySize, rating: 5, reviews: 0 };
    upsertProduct(product);
    setCatalog(getProducts());
  };

  const addNewCollection = () => {
    const name = prompt("New collection name")?.trim();
    if (!name) return;
    addCollection(name);
    setCollections(getCollections());
  };

  const changeOrderStatus = (id: string, status: OrderStatus) => {
    updateOrderStatus(id, status);
    setOrders(listOrders());
  };

  const refreshUserCart = (userId: string) => {
    setUserCarts((prev) => ({ ...prev, [userId]: readUserCart(userId) }));
  };

  return (
    <main className="container py-10 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Admin Panel</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { resetStocksRandom(); setStocks(getAllStocks()); }}>Reset Random Stock</Button>
          <Button onClick={addNewProduct}>Add Product</Button>
          <Button onClick={addNewCollection}>Add Collection</Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Logged in as: {user.email}</p>

      <section>
        <h2 className="font-serif text-2xl">Products</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((p) => (
            <div key={p.id} className="border rounded-lg p-4 space-y-3">
              <div className="text-xs text-muted-foreground">#{p.id}</div>
              <img src={p.image} alt={p.name} className="h-32 w-full object-cover rounded" />
              <Input value={p.name} onChange={(e) => saveProduct({ ...p, name: e.target.value })} />
              <select
                className="w-full border rounded px-2 py-2"
                value={p.collection}
                onChange={(e) => saveProduct({ ...p, collection: e.target.value })}
              >
                {COLLECTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                {!COLLECTIONS.includes(p.collection as any) && (
                  <option value={p.collection}>{p.collection}</option>
                )}
              </select>
              <textarea className="w-full border rounded p-2 text-sm" placeholder="Description" value={p.description} onChange={(e) => saveProduct({ ...p, description: e.target.value })} />
              <div className="grid grid-cols-4 gap-2 text-sm">
                {p.sizes.map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <span>{s}</span>
                    <Input type="number" value={p.priceBySize[s] ?? 0} onChange={(e) => saveProduct({ ...p, priceBySize: { ...p.priceBySize, [s]: Number(e.target.value) || 0 } })} />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5">S</span>
                    <Input type="number" className="w-24" value={stocks[p.id]?.S ?? 0} onChange={(e) => setOneStock(p.id, "S", Number(e.target.value) || 0)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5">M</span>
                    <Input type="number" className="w-24" value={stocks[p.id]?.M ?? 0} onChange={(e) => setOneStock(p.id, "M", Number(e.target.value) || 0)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5">L</span>
                    <Input type="number" className="w-24" value={stocks[p.id]?.L ?? 0} onChange={(e) => setOneStock(p.id, "L", Number(e.target.value) || 0)} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!stocks[p.id]?.kids}
                    onChange={(e) => {
                      setKidsAvailable(p.id, e.target.checked);
                      setStocks((s) => ({ ...s, [p.id]: { ...(s[p.id] ?? { S: 0, M: 0, L: 0, kids: false }), kids: e.target.checked } }));
                    }}
                  />
                  Kids available
                </label>
                <div className="flex">
                  <Button variant="destructive" className="ml-auto" onClick={() => { deleteProduct(p.id); setCatalog(getProducts()); }}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Orders</h2>
        <div className="mt-4 space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="border rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span>Order #{o.id.slice(0,8)} · User {o.userId}</span>
                <select className="border rounded px-2 py-1" value={o.status} onChange={(e) => changeOrderStatus(o.id, e.target.value as OrderStatus)}>
                  <option value="verify">verify</option>
                  <option value="in_process">in process</option>
                  <option value="delivered">delivered</option>
                </select>
              </div>
              <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5">
                {o.items.map((i) => (
                  <li key={i.id + i.size}>{i.name} {i.size ? `(${i.size})` : ""} × {i.qty}</li>
                ))}
              </ul>
            </div>
          ))}
          {orders.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Users & Carts</h2>
        <div className="mt-4 space-y-3">
          {users.map((u) => {
            const cart = userCarts[u.id] ?? [];
            return (
              <div key={u.id} className="space-y-3 rounded-lg border p-4">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div className="font-medium">{u.name} · {u.email}</div>
                  <div className="text-sm text-muted-foreground">Cart items: {cart.length}</div>
                </div>
                <ul className="space-y-2 text-sm">
                  {cart.map((i) => (
                    <li
                      key={i.id + (i.size ?? "")}
                      className="flex flex-wrap items-center gap-2 rounded border border-dashed p-2"
                    >
                      <span className="min-w-[200px] flex-1">{i.name} {i.size ? `(${i.size})` : ""} × {i.qty}</span>
                    </li>
                  ))}
                  {cart.length === 0 && <li className="text-muted-foreground">Cart is empty.</li>}
                </ul>
              </div>
            );
          })}
          {users.length === 0 && <p className="text-muted-foreground">No users yet.</p>}
        </div>
      </section>
    </main>
  );
}
