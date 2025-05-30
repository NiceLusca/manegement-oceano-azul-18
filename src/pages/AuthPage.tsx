
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Conta criada com sucesso",
          description: "Verifique seu e-mail para confirmar o cadastro",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo à plataforma Oceano Azul",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: error.message || "Ocorreu um erro ao processar sua solicitação",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFC] dark:bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <img 
            src="/lovable-uploads/1a19e937-b0a5-45b2-8e63-f4f3993e46a4.png" 
            alt="Oceano Azul" 
            className="h-32 w-auto mb-5 animate-fade-in" 
          />
          <h1 className="text-4xl font-bold text-[#005B99] mb-2">Oceano Azul</h1>
          <p className="text-[#6B7280] text-lg">Plataforma de Gerenciamento</p>
        </div>

        <Card className="border-[#E5E7EB] shadow-md bg-white dark:bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold text-[#005B99] dark:text-foreground">
              {isSignUp ? "Criar conta" : "Entrar"}
            </CardTitle>
            <CardDescription className="text-[#6B7280] dark:text-muted-foreground">
              {isSignUp
                ? "Preencha os campos abaixo para criar sua conta"
                : "Entre com seu e-mail e senha"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-[#6B7280] dark:text-foreground">
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-[#E5E7EB] focus:border-[#005B99] focus:ring-[#005B99]/20"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-[#6B7280] dark:text-foreground">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-[#E5E7EB] focus:border-[#005B99] focus:ring-[#005B99]/20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-[#6B7280] hover:text-[#005B99]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                className="w-full bg-[#005B99] hover:bg-[#00487A] text-white transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading
                  ? "Processando..."
                  : isSignUp
                  ? "Criar conta"
                  : "Entrar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full text-[#005B99] border-[#E5E7EB] hover:bg-[#D0E9FF]/50 hover:text-[#00487A] hover:border-[#005B99] transition-colors duration-200"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp
                  ? "Já tem uma conta? Entrar"
                  : "Não tem uma conta? Criar"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
