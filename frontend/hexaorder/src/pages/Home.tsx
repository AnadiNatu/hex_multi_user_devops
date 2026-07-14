import { Link } from "react-router-dom";
import { Package, ShieldCheck, Boxes, BarChart3, ArrowRight, Users, Lock } from "lucide-react";
import { Button } from "../components/ui/Button";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "http://localhost:8080";

export default function Home() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)",
      }}
    >
      <div className="absolute inset-0 auth-glow-green pointer-events-none" />
      <div className="absolute inset-0 auth-grid-lines pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <header className="py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-green flex items-center justify-center shadow-xl shadow-brand-green/30">
              <Package className="text-white w-6 h-6"/>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">HexaOrder</h1>
              <p className="text-slate-400 text-sm">Product Ordering Management System</p>
            </div>
          </div>

          <div className="hidden md:flex gap-3">
            <Link to="/login"><Button variant="outline">Sign In</Button></Link>
            <Link to="/signup"><Button>Create Account</Button></Link>
          </div>
        </header>

        <section className="grid lg:grid-cols-2 gap-16 items-center py-20">
          <div>
            <span className="inline-flex px-4 py-2 rounded-full bg-brand-green/10 border border-brand-green/30 text-brand-green font-semibold text-sm">
              Enterprise Ready
            </span>

            <h2 className="mt-6 text-5xl font-black text-white leading-tight">
              Modern Product &
              <span className="text-brand-green"> Order Management</span>
            </h2>

            <p className="mt-6 text-lg text-slate-300 leading-8">
              Secure inventory, order processing, analytics, JWT authentication,
              Google OAuth2, role-based authorization and cloud deployment
              bundled into one modern platform.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/login">
                <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4"/>}>
                  Sign In
                </Button>
              </Link>

              <Link to="/signup">
                <Button variant="outline" size="lg">
                  Create Account
                </Button>
              </Link>
            </div>

            <a
              href={`${API_BASE}/oauth2/authorization/google`}
              className="inline-flex mt-5 text-brand-green hover:underline font-semibold"
            >
              Continue with Google →
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {icon:Boxes,title:"Inventory",text:"Manage products and stock."},
              {icon:Users,title:"Users",text:"Role based user management."},
              {icon:BarChart3,title:"Analytics",text:"Revenue and order insights."},
              {icon:Lock,title:"Security",text:"JWT, OAuth2 & RBAC."},
            ].map((f)=>(
              <div key={f.title} className="bg-white/10 backdrop-blur rounded-2xl border border-white/10 p-6 hover:border-brand-green/40 transition-all">
                <f.icon className="w-10 h-10 text-brand-green mb-4"/>
                <h3 className="text-xl font-bold text-white">{f.title}</h3>
                <p className="text-slate-300 mt-2">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-20">
          <div className="bg-white/5 backdrop-blur rounded-3xl border border-white/10 p-10 text-center">
            <ShieldCheck className="mx-auto text-brand-green w-12 h-12"/>
            <h3 className="mt-4 text-3xl font-bold text-white">
              Built for Secure Enterprise Applications
            </h3>
            <p className="mt-4 max-w-3xl mx-auto text-slate-300">
              HexaOrder combines Spring Boot microservices, React, PostgreSQL,
              JWT authentication, Google OAuth2, cloud deployment and modern UI
              into a scalable ordering platform.
            </p>

            <div className="mt-8">
              <Link to="/signup">
                <Button size="lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
