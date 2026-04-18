import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — Ceylon Kandy Events" },
      { name: "description", content: "Create a Ceylon Kandy Events customer account to manage your bookings and tickets." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Account created");
    navigate({ to: "/my-bookings" });
  };

  return (
    <SiteLayout>
      <section className="py-32">
        <div className="container-luxe max-w-md">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.5em] text-gold uppercase mb-4">Join the Circle</p>
            <h1 className="font-display text-5xl text-ivory">Create <span className="text-gradient-gold italic">Account</span></h1>
          </div>
          <form onSubmit={handleSubmit} className="border border-gold-soft bg-charcoal p-8 space-y-5">
            <div>
              <label className="block text-xs tracking-[0.3em] text-gold uppercase mb-3">Full Name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-onyx border border-gold-soft px-4 py-3 text-ivory focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs tracking-[0.3em] text-gold uppercase mb-3">Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-onyx border border-gold-soft px-4 py-3 text-ivory focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs tracking-[0.3em] text-gold uppercase mb-3">Password</label>
              <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-onyx border border-gold-soft px-4 py-3 text-ivory focus:outline-none focus:border-gold" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs font-medium rounded-sm disabled:opacity-60 hover:shadow-gold-lg transition-all">
              {loading ? "Creating..." : "Create Account"}
            </button>
            <p className="text-center text-sm text-muted-foreground pt-4 border-t border-gold-soft">
              Already a member?{" "}
              <Link to="/login" className="text-gold hover:text-gold-bright">Sign in</Link>
            </p>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
