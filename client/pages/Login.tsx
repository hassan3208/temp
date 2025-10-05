// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useAuth } from "@/context/AuthContext";
// import { useNavigate, Link } from "react-router-dom";

// export default function Login() {
//   const { login } = useAuth();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const navigate = useNavigate();

//   const submit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     try {
//       await login(email, password);
//       navigate("/");
//     } catch (err: any) {
//       setError(err.message || "Login failed");
//     }
//   };

//   return (
//     <div className="container py-16 max-w-md">
//       <h1 className="font-serif text-3xl">Login</h1>
//       <form onSubmit={submit} className="mt-6 space-y-4">
//         <div>
//           <label className="text-sm">Email</label>
//           <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//         </div>
//         <div>
//           <label className="text-sm">Password</label>
//           <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//         </div>
//         {error && <p className="text-sm text-destructive">{error}</p>}
//         <Button type="submit" className="w-full">Login</Button>
//         <p className="text-sm text-muted-foreground">No account? <Link to="/signup" className="underline">Sign up</Link></p>
//       </form>
//     </div>
//   );
// }


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // Call backend login
      await login(username, password);
      navigate("/"); // redirect to home after successful login
    } catch (err: any) {
      // Show backend error message
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(err.message || "Login failed");
      }
    }
  };

  return (
    <div className="container py-16 max-w-md mx-auto">
      <h1 className="font-serif text-3xl">Login</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm">Username</label>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
          />
        </div>
        <div>
          <label className="text-sm">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full">
          Login
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          No account? <Link to="/signup" className="underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
