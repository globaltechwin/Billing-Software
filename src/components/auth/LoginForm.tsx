"use client";

import { useState, type FormEvent } from "react";
import {
  User,
  Lock,
  LogIn,
  MessageCircle,
  QrCode,
  Smartphone,
  ExternalLink,
  Star,
  ShoppingBag,
  BarChart3,
  Globe,
  Hash,
} from "lucide-react";

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const FEATURES = [
  { icon: BarChart3, label: "Billing" },
  { icon: ShoppingBag, label: "Inventory" },
  { icon: Hash, label: "Production" },
  { icon: Globe, label: "Web Orders" },
  { icon: Smartphone, label: "Mobile Orders" },
  { icon: QrCode, label: "QR Ordering" },
] as const;

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid username or password");
        return;
      }

      localStorage.setItem("billora_user", JSON.stringify(data.user));

      localStorage.setItem(
        "billora_permissions",
        JSON.stringify(data.allowedModules),
      );

      // Store menu access paths (null = no custom access = show all)
      if (data.allowedMenuPaths) {
        localStorage.setItem("billora_menu_paths", JSON.stringify(data.allowedMenuPaths));
      } else {
        localStorage.removeItem("billora_menu_paths");
      }

      // Full-page navigation (not router.push): guarantees the freshly-set
      // httpOnly session cookie is attached to the next request. On phones,
      // a client-side push can race the Set-Cookie and the middleware would
      // bounce the user straight back to the login page.
      window.location.href = "/welcome";
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-bg flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="login-card flex w-full max-w-[1100px] min-h-[580px] rounded-2xl overflow-hidden">
        {/* Left Column — Login Form */}
        <div className="w-full lg:w-[42%] bg-white flex flex-col p-8 sm:p-10 lg:p-10">
          <div>
            {/* Brand */}
            <div className="flex items-center gap-2.5 mb-8 animate-fade-in">
              <div className="brand-icon w-9 h-9 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm tracking-tight">
                  B
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                Billora
              </span>
            </div>

            <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 mb-1.5 animate-fade-in-delay">
              Welcome back
            </h1>
            <p className="text-sm text-gray-400 mb-7 animate-fade-in-delay">
              Sign in to your account to continue
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-3.5 animate-fade-in-delay-2"
            >
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">
                  <User size={17} />
                </span>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  className="input-field w-full pl-11 pr-4 py-3 rounded-lg text-sm text-gray-800 placeholder-gray-400"
                  autoComplete="username"
                />
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">
                  <Lock size={17} />
                </span>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className="input-field w-full pl-11 pr-4 py-3 rounded-lg text-sm text-gray-800 placeholder-gray-400"
                  autoComplete="current-password"
                />
              </div>

              {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}

              <p className="text-[11px] text-gray-400 text-center">
                Enter your registered username and password
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-signin w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg text-sm"
              >
                <LogIn size={17} />
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>

          {/* Bottom section — tight spacing */}
          <div className="mt-12 sm:mt-24">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="facebook-link flex items-center justify-center gap-2 text-[13px] text-red-500 hover:text-red-600"
            >
              <FacebookIcon size={15} />
              Follow us on Facebook
            </a>

            <div className="mt-10 sm:mt-20 space-y-2">
              <div className="flex justify-center">
                <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <MessageCircle size={20} className="text-gray-300" />
                </div>
              </div>

              <p className="text-center text-[11px] text-gray-400 leading-relaxed">
                &copy; 2024 All rights reserved, Powered with{" "}
                <span className="text-red-500">&hearts;</span> by{" "}
                <a
                  href="#"
                  className="underline hover:text-gray-600 transition-colors"
                >
                  3Pals Technologies
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column — Marketing / Features */}
        <div className="hidden lg:flex w-[58%] right-panel flex-col p-10 overflow-hidden">
          <h2 className="text-[28px] font-bold text-white text-center mb-2 leading-tight">
            Everything You Need
            <br />
            in One Platform
          </h2>
          <p className="text-sm text-gray-400 text-center mb-5">
            Billing &middot; Inventory &middot; Online &amp; Mobile Ordering
          </p>

          <div className="flex items-center gap-2 mb-4">
            <span className="new-badge inline-flex items-center gap-1 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              <Star size={9} fill="currentColor" />
              NEW
            </span>
            <span className="text-white font-semibold text-sm">
              New Features
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 mb-5">
            {/* QR Code Ordering Card */}
            <div className="feature-card rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <QrCode size={15} className="text-red-400" />
                </div>
                <div>
                  <p className="text-white text-[11px] font-semibold">
                    QR Code Ordering
                  </p>
                  <p className="text-gray-400 text-[9px]">
                    Scan &amp; order instantly
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-gray-900">
                    Taste.
                  </span>
                  <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    🛒 0
                  </span>
                </div>
                <div className="bg-gray-100 rounded px-2 py-1 mb-1.5">
                  <span className="text-[9px] text-gray-400">
                    🔍 Search dishes...
                  </span>
                </div>
                <div className="flex gap-0.5 mb-1.5">
                  {["Dosa", "Idly", "Rice", "Meals"].map((item) => (
                    <span
                      key={item}
                      className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                        item === "Dosa"
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
                {[
                  { name: "Masala Dosa", price: "95.00" },
                  { name: "Ghee Roast", price: "120.00" },
                  { name: "Butter Dosa", price: "85.00" },
                ].map((dish) => (
                  <div
                    key={dish.name}
                    className="flex items-center justify-between py-1 border-t border-gray-100"
                  >
                    <div>
                      <p className="text-[9px] font-semibold text-gray-800">
                        {dish.name}
                      </p>
                      <p className="text-[8px] text-gray-400">Dosa Varieties</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-gray-800">
                        ₹ {dish.price}
                      </p>
                      <button className="text-[7px] bg-red-500 text-white px-1.5 py-0.5 rounded mt-0.5">
                        + Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-[9px] text-gray-400 mt-1.5 flex items-center justify-center gap-1">
                View Live Menu <ExternalLink size={8} />
              </p>
            </div>

            {/* E-Bill on WhatsApp Card */}
            <div className="feature-card rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Smartphone size={15} className="text-green-400" />
                </div>
                <div>
                  <p className="text-white text-[11px] font-semibold">
                    E-Bill on WhatsApp
                  </p>
                  <p className="text-gray-400 text-[9px]">
                    Digital bill in seconds
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[7px] font-bold">
                    TB
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-900">
                      Touch4Bill Demo
                    </p>
                    <p className="text-[7px] text-gray-400">
                      Happy Days, Kompally
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-1.5 mb-1.5">
                  <div className="flex justify-between text-[7px] text-gray-500 mb-0.5">
                    <span>BILL NO</span>
                    <span>DATE</span>
                    <span>ITEMS</span>
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-gray-800">
                    <span>#V00853</span>
                    <span>28/04/26</span>
                    <span>3</span>
                  </div>
                </div>
                <div className="text-[7px] text-gray-500 flex justify-between mb-0.5">
                  <span>PRODUCT</span>
                  <span>QTY</span>
                  <span>AMT</span>
                </div>
                {[
                  { product: "Masala Dosa", qty: "1", amt: "₹95" },
                  { product: "Filter Coffee", qty: "2", amt: "₹90" },
                  { product: "Idly (2pc)", qty: "1", amt: "₹60" },
                ].map((item) => (
                  <div
                    key={item.product}
                    className="flex justify-between text-[8px] text-gray-700 py-0.5"
                  >
                    <span>{item.product}</span>
                    <span>{item.qty}</span>
                    <span>{item.amt}</span>
                  </div>
                ))}
                <div className="flex justify-between text-[9px] font-bold text-gray-900 border-t border-gray-200 mt-1 pt-1">
                  <span>NET AMOUNT</span>
                  <span>₹245</span>
                </div>
                <div className="bg-green-500 text-white text-[8px] text-center py-1 rounded mt-1.5 flex items-center justify-center gap-0.5">
                  ✓ Sent via WhatsApp
                </div>
              </div>
              <p className="text-center text-[9px] text-gray-400 mt-1.5 flex items-center justify-center gap-1">
                View Sample Bill <ExternalLink size={8} />
              </p>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-auto">
            {FEATURES.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="feature-pill flex items-center gap-1.5 text-gray-300 text-[11px] px-3 py-1.5 rounded-full"
              >
                <Icon size={11} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
