import { useEffect, useState } from "react";

type Tema = "light" | "dark";

export function useTheme() {
  const [tema, setTema] = useState<Tema>(() => {
    const salvo = localStorage.getItem("tema");
    return (salvo as Tema) ?? "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tema === "dark");
    localStorage.setItem("tema", tema);
  }, [tema]);

  function alternar() {
    setTema((atual) => (atual === "light" ? "dark" : "light"));
  }

  return { tema, alternar };
}