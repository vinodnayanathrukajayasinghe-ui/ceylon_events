import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Ceylon Kandy Events" },
      { name: "description", content: "Customer and admin sign in to Ceylon Kandy Events." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error, isAdmin } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Welcome back");
    navigate({ to: isAdmin ? "/admin" : "/my-bookings" });
  };

  return (
    <SiteLayout>
      <section className="py-32">
        <div className="container-luxe max-w-md">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.5em] text-gold uppercase mb-4">Welcome Back</p>
            <h1 className="font-display text-5xl text-ivory">Sign <span className="text-gradient-gold italic">In</span></h1>
          </div>
          <form onSubmit={handleSubmit} className="border border-gold-soft bg-charcoal p-8 space-y-5">
            <div>
              <label className="block text-xs tracking-[0.3em] text-gold uppercase mb-3">Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-onyx border border-gold-soft px-4 py-3 text-ivory focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs tracking-[0.3em] text-gold uppercase mb-3">Password</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-onyx border border-gold-soft px-4 py-3 text-ivory focus:outline-none focus:border-gold" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs font-medium rounded-sm disabled:opacity-60 hover:shadow-gold-lg transition-all">
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <p className="text-center text-sm text-muted-foreground pt-4 border-t border-gold-soft">
              No account?{" "}
              <Link to="/signup" className="text-gold hover:text-gold-bright">Create one</Link>
            </p>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
