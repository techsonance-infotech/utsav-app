"use client";

import React, { useState, useEffect } from "react";
import { useSignUp, supabase } from "@utsav/api-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  AlertCircle,
  Check,
  Flame
} from "lucide-react";

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${met ? "text-emerald-600" : "text-neutral-400"}`}>
      {met ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 ml-1.5 mr-1" />}
      <span>{text}</span>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const signupMutation = useSignUp();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [signUpError, setSignUpError] = useState("");
  const [success, setSuccess] = useState(false);

  // Field validation checks
  const isFirstNameValid = firstName.trim().length >= 2;
  const isLastNameValid = lastName.trim().length >= 2;
  const isUsernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = /^\d{10}$/.test(phone);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordStrong = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  const isFormValid =
    isFirstNameValid &&
    isLastNameValid &&
    isUsernameValid &&
    isEmailValid &&
    isPhoneValid &&
    isPasswordStrong &&
    passwordsMatch;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
    setPhone(value);
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const getInputClass = (isValid: boolean, field: string, value: string) => {
    const base =
      "w-full h-14 pl-12 pr-4 bg-cream border border-sandstone rounded-xl focus:border-primary focus:ring-4 focus:ring-primary-container/10 outline-none transition-all font-body-lg text-body-lg placeholder:text-neutral-400";
    if (!touched[field] || value === "") return base;
    return isValid
      ? `${base} border-emerald-500/50 focus:border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.03)]`
      : `${base} border-rose-500/50 focus:border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.03)]`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");
    setTouched({
      firstName: true,
      lastName: true,
      username: true,
      phone: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (!isFormValid) {
      setSignUpError("Please fill all required fields correctly.");
      return;
    }

    try {
      await signupMutation.mutateAsync({
        firstName,
        lastName,
        username,
        phone,
        email,
        password,
      });
      setSuccess(true);
    } catch (err: any) {
      setSignUpError(err.message || "Failed to create account. Username or email might already be registered.");
    }
  };

  return (
    <div className="bg-puja-white font-body-md text-on-background min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Hero Decorative Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Radial Gradient for Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-container/10 via-transparent to-transparent"></div>
        {/* Floating Decorative Elements */}
        <div className="absolute top-[10%] right-[15%] text-aarti-gold/20 select-none">
          <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 0" }}>brightness_high</span>
        </div>
        <div className="absolute bottom-[10%] left-[10%] text-primary-container/10 select-none">
          <span className="material-symbols-outlined text-[160px]">festival</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="relative z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20">
        <div className="flex items-center gap-2">
          <div className="w-32 h-16 transition-transform duration-300 hover:scale-105">
            <img
              className="w-full h-full object-contain"
              alt="Utsav logo"
              src="/logo.png"
            />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="/login">Sign In</Link>
        </div>
      </nav>

      {/* Auth Section */}
      <main className="flex-grow flex items-center justify-center relative z-10 px-margin-mobile py-xl">
        <div className="w-full max-w-[560px]">
          
          {/* Card Container */}
          <div className="glass-card border border-sandstone rounded-[24px] shadow-lg p-lg md:p-xl flex flex-col gap-xl">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="font-display-xl text-display-xl text-on-surface">Join the Celebration</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Create your Utsav account to manage mandals and festivals.</p>
            </div>

            {/* Success State Card */}
            {success ? (
              <div className="text-center py-12 px-6 bg-orange-50/50 border border-sandstone rounded-2xl animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
                  <span className="material-symbols-outlined text-white text-3xl">mail</span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">Verify Your Email</h3>
                <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                  We've sent a verification link to <strong className="text-primary">{email}</strong>. Please check your inbox and click the link to activate your account and start your 14-day trial.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-12 px-6 bg-primary text-on-primary rounded-xl font-label-md hover:bg-surface-tint active:scale-98 transition-all"
                >
                  Go to Sign In
                </Link>
              </div>
            ) : (
              <>
                {/* Form Alert Box */}
                {signUpError && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100 animate-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-700 font-medium leading-relaxed">{signUpError}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleRegister} className="space-y-lg">
                  
                  {/* First Name & Last Name Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="space-y-xs group">
                      <label className="block font-label-md text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors" htmlFor="firstName">First Name</label>
                      <div className="relative saffron-glow transition-all rounded-xl">
                        <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">person</span>
                        </div>
                        <input
                          className={getInputClass(isFirstNameValid, "firstName", firstName)}
                          id="firstName"
                          placeholder="John"
                          required
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          onBlur={() => handleBlur("firstName")}
                          disabled={signupMutation.isPending}
                        />
                      </div>
                    </div>

                    <div className="space-y-xs group">
                      <label className="block font-label-md text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors" htmlFor="lastName">Last Name</label>
                      <div className="relative saffron-glow transition-all rounded-xl">
                        <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">person</span>
                        </div>
                        <input
                          className={getInputClass(isLastNameValid, "lastName", lastName)}
                          id="lastName"
                          placeholder="Doe"
                          required
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          onBlur={() => handleBlur("lastName")}
                          disabled={signupMutation.isPending}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Username Field */}
                  <div className="space-y-xs group">
                    <label className="block font-label-md text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors" htmlFor="username">Username</label>
                    <div className="relative saffron-glow transition-all rounded-xl">
                      <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                        <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                      </div>
                      <input
                        className={getInputClass(isUsernameValid, "username", username)}
                        id="username"
                        placeholder="john_doe"
                        required
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={() => handleBlur("username")}
                        disabled={signupMutation.isPending}
                      />
                    </div>
                    {touched.username && username && !isUsernameValid && (
                      <p className="text-[10px] text-rose-500 ml-1">Min 3 characters, alphanumeric & underscores only</p>
                    )}
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    {/* Email */}
                    <div className="space-y-xs group">
                      <label className="block font-label-md text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors" htmlFor="email">Email Address</label>
                      <div className="relative saffron-glow transition-all rounded-xl">
                        <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">mail</span>
                        </div>
                        <input
                          className={getInputClass(isEmailValid, "email", email)}
                          id="email"
                          placeholder="rahul@example.com"
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => handleBlur("email")}
                          disabled={signupMutation.isPending}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-xs group">
                      <label className="block font-label-md text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors" htmlFor="phone">Phone Number</label>
                      <div className="relative saffron-glow transition-all rounded-xl">
                        <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none font-label-md text-on-surface-variant bg-sandstone/30 rounded-l-xl h-[54px] w-12 justify-center border-r border-sandstone">
                          +91
                        </div>
                        <input
                          className={`${getInputClass(isPhoneValid, "phone", phone)} pl-[60px]`}
                          id="phone"
                          placeholder="9876543210"
                          required
                          type="tel"
                          value={phone}
                          onChange={handlePhoneChange}
                          onBlur={() => handleBlur("phone")}
                          disabled={signupMutation.isPending}
                        />
                      </div>
                      {touched.phone && phone && !isPhoneValid && (
                        <p className="text-[10px] text-rose-500 ml-1">Exactly 10 digits required</p>
                      )}
                    </div>
                  </div>

                  {/* Password & Confirm Password Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    {/* Password */}
                    <div className="space-y-xs group">
                      <label className="block font-label-md text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors" htmlFor="password">Password</label>
                      <div className="relative saffron-glow transition-all rounded-xl">
                        <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">lock</span>
                        </div>
                        <input
                          className={`${getInputClass(isPasswordStrong, "password", password)} pr-10`}
                          id="password"
                          placeholder="••••••••"
                          required
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={() => handleBlur("password")}
                          disabled={signupMutation.isPending}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                      {password && !isPasswordStrong && (
                        <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mt-1 ml-1">
                          <PasswordRequirement met={hasMinLength} text="8+ chars" />
                          <PasswordRequirement met={hasUppercase} text="Upper" />
                          <PasswordRequirement met={hasLowercase} text="Lower" />
                          <PasswordRequirement met={hasNumber} text="Num" />
                          <PasswordRequirement met={hasSpecial} text="Sym" />
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-xs group">
                      <label className="block font-label-md text-label-md text-on-surface-variant group-focus-within:text-primary transition-colors" htmlFor="confirmPassword">Confirm Password</label>
                      <div className="relative saffron-glow transition-all rounded-xl">
                        <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                        </div>
                        <input
                          className={`${getInputClass(passwordsMatch, "confirmPassword", confirmPassword)} pr-10`}
                          id="confirmPassword"
                          placeholder="Re-enter password"
                          required
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onBlur={() => handleBlur("confirmPassword")}
                          disabled={signupMutation.isPending}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showConfirmPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                      {touched.confirmPassword && confirmPassword && !passwordsMatch && (
                        <p className="text-[10px] text-rose-500 ml-1">Passwords do not match</p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    className="w-full h-[56px] bg-primary-container text-on-primary-container font-headline-sm text-headline-sm rounded-xl shadow-lg shadow-primary-container/20 hover:bg-primary transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={signupMutation.isPending || !isFormValid}
                  >
                    {signupMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Create Account
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-sandstone"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-outline">Social Signup</span></div>
                </div>

                {/* Social Action */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setSignUpError("");
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: "google",
                        options: { redirectTo: `${window.location.origin}/auth/callback` },
                      });
                      if (error) throw error;
                    } catch (err: any) {
                      setSignUpError(err.message || "Failed to initialize Google signup.");
                    }
                  }}
                  className="w-full h-[56px] bg-puja-white border border-sandstone rounded-xl font-label-md text-label-md flex items-center justify-center gap-3 hover:bg-cream transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  Continue with Google
                </button>

                {/* Footer Link */}
                <div className="text-center">
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Already have an account?{" "}
                    <Link className="text-primary font-semibold hover:underline" href="/login">
                      Sign In
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>




        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-xl px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-lg border-t border-sandstone/50 bg-surface-container-low/50 backdrop-blur-sm mt-8">
        <p className="font-body-md text-body-md text-on-surface-variant">© {new Date().getFullYear()} Utsav Digital Platforms. All rights reserved.</p>
        <div className="flex gap-lg">
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary hover:underline underline-offset-4 transition-all" href="/privacy-policy">Privacy Policy</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary hover:underline underline-offset-4 transition-all" href="/terms-of-service">Terms of Service</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary hover:underline underline-offset-4 transition-all" href="/help-center">Help Center</Link>
        </div>
      </footer>
    </div>
  );
}
