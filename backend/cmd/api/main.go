package main

import (
	"context"
	"log"
	"net/http"

	"github.com/MachadoJorgeH/sabor-da-vila/backend/internal/config"
	"github.com/MachadoJorgeH/sabor-da-vila/backend/internal/httpx"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	cfg, err := config.Carregar()
	if err != nil {
		log.Fatalf("erro ao carregar configuração: %v", err)
	}

	pool, err := pgxpool.New(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("erro ao criar o pool de conexões: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(context.Background()); err != nil{
		log.Fatalf("erro ao conectar no banco: %v", err)
	}

	log.Printf("conectado no Postgres")

	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/saude", func(w http.ResponseWriter, r *http.Request){
		httpx.EscreverJSON(w, http.StatusOK, map[string]bool{"ok": true})
	})

	endereco := ":" + cfg.PortaHTTP
	log.Printf("servidor escutando em http://localhost%s", endereco)

	if err := http.ListenAndServe(endereco, mux); err != nil{
		log.Fatalf("erro ao subir o servidor: %v", err)
	}
}
