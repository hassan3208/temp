import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Sheet, SheetTrigger, SheetContent, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, User, LogOut, Home, Heart, Info, Phone, ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function MobileNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <img src="https://i.postimg.cc/KYZqc2Yr/Screenshot-2025-10-02-105818.png" alt="Rangista" className="h-7 w-7 rounded-full bg-accent" />
              <span>Menu</span>
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            <div>
              <Input
                placeholder="Search products"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const params = new URLSearchParams(window.location.search);
                    if (q) params.set("q", q); else params.delete("q");
                    const next = `${window.location.pathname}?${params.toString()}`;
                    window.history.replaceState(null, "", next);
                    navigate("/");
                  }
                }}
              />
            </div>

            <nav className="flex flex-col">
              <SheetClose asChild>
                <NavItem to="/" label="Home" icon={<Home className="h-4 w-4" />} />
              </SheetClose>
              <SheetClose asChild>
                <NavItem to="/about" label="About" icon={<Info className="h-4 w-4" />} />
              </SheetClose>
              <SheetClose asChild>
                <NavItem to="/contact" label="Contact" icon={<Phone className="h-4 w-4" />} />
              </SheetClose>
              <SheetClose asChild>
                <NavItem to="/favorites" label="Favorites" icon={<Heart className="h-4 w-4" />} />
              </SheetClose>
              <SheetClose asChild>
                <NavItem to="/orders" label="Orders" icon={<ShoppingBag className="h-4 w-4" />} />
              </SheetClose>
              {user && (
                <SheetClose asChild>
                  <NavItem to="/profile" label="Profile" icon={<User className="h-4 w-4" />} />
                </SheetClose>
              )}
            </nav>

            <div className="pt-2 border-t flex items-center gap-2">
              {user ? (
                <>
                  <div className="text-sm">Hi, {user.name?.split(" ")[0] || user.email}</div>
                  <Button size="sm" variant="outline" className="ml-auto" onClick={() => { logout(); }}>
                    <LogOut className="mr-1 h-4 w-4" /> Logout
                  </Button>
                </>
              ) : (
                <div className="flex gap-2 w-full">
                  <SheetClose asChild>
                    <Button className="flex-1" onClick={() => navigate("/login")}>Login</Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button variant="outline" className="flex-1" onClick={() => navigate("/signup")}>Sign up</Button>
                  </SheetClose>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NavItem({ to, label, icon }: { to: string; label: string; icon?: React.ReactNode }) {
  return (
    <Link to={to} className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
      {icon}
      <span>{label}</span>
    </Link>
  );
}
