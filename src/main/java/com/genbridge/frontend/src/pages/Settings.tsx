import { motion } from "framer-motion";
import AppSidebar from "@/components/AppSidebar";
import { useTheme, ThemeMode } from "@/context/ThemeContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MODES: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark",  label: "Dark"  },
  { value: "auto",  label: "Auto"  },
];

const Settings = () => {
  const { mode, setMode } = useTheme();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmNewPassword) {
      toast({
        title: "Passwords don't match",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
await api.put("/auth/change-password", {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      toast({
        title: "Password changed successfully!",
        description: "You can now log in with your new password."
      });
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      });
    } catch (error: any) {
      const errorMsg = typeof error.response?.data === "string"
        ? error.response.data
        : error.response?.data?.message || "Something went wrong.";
      toast({
        title: "Failed to change password",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activePage="settings" />

      <div className="flex-1 ml-72 pt-12 pb-16 px-8">
        <div className="max-w-3xl mx-auto">

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-foreground mb-6"
          >
            Settings
          </motion.h1>

          {/* Appearance card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <h2 className="font-display text-xl font-bold text-card-foreground mb-6">
              Appearance
            </h2>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-card-foreground">
                Choose your preferred color mode
              </span>

              {/* Toggle pill */}
              <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                {MODES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setMode(value)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      mode === value
                        ? "bg-foreground text-background shadow"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Password Change */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-6 mt-6"
          >
            <h2 className="font-display text-xl font-bold text-card-foreground mb-6">
              Change Password
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="old-password">Old Password</Label>
                <div className="relative">
                  <Input
                    id="old-password"
                    type={showPasswords.old ? "text" : "password"}
                    placeholder="Enter your current password"
                    value={formData.oldPassword}
                    onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                  >
                    {showPasswords.old ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Enter new password (minimum 8 characters)"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    minLength={8}
                    className="pr-10"
                    required
                  />
                  {formData.newPassword.length > 0 && formData.newPassword.length < 8 && (
                    <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters</p>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={formData.confirmNewPassword}
                    onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                className="w-full"
                disabled={loading || formData.newPassword.length < 8 || !formData.oldPassword || !formData.confirmNewPassword}
              >
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
