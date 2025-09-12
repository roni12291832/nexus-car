export default function AuthCodeErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-red-500">Erro de autenticação</h1>
      <p className="text-muted-foreground mt-2">
        Não foi possível completar o login. Tente novamente.
      </p>
    </div>
  );
}
