"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/types";
import { useFetch, useApiCall } from "@/lib/hooks";

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateUserForm>({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: usersData, loading, refetch } = useFetch<{ users: User[] }>("/api/users");
  const { execute: createUser } = useApiCall<{ user: User }>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createUser("/api/users", {
        body: formData,
      });

      setSuccess("User created successfully");
      setFormData({ name: "", email: "", password: "", role: "user" });
      setShowForm(false);
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    }
  };

  const users = usersData?.users ?? [];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b bg-white dark:bg-neutral-900">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">Watchtower</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">User Management</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add User"}
          </Button>
        </div>

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            {success}
          </div>
        )}

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
              <CardDescription>
                Create a new user account for Watchtower
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="user@watchtower.local"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full">
                  Create User
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Manage user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-neutral-600 dark:text-neutral-400">
                Loading users...
              </p>
            ) : users.length === 0 ? (
              <p className="text-neutral-600 dark:text-neutral-400">
                No users found
              </p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-4 border-b pb-2 font-semibold">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Created</div>
                </div>
                {users.map((user: User) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-4 gap-4 border-b py-2 text-sm"
                  >
                    <div>{user.name}</div>
                    <div>{user.email}</div>
                    <div>
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs ${
                          user.role === "admin"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <div className="text-neutral-600 dark:text-neutral-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
