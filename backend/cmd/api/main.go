package main

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	urlBanco := "postgres://sabor:senha_dev@127.0.0.1:5432/sabor?sslmode=disable"

	pool, err := pgxpool.New(context.Background(), urlBanco)
	if err != nil {
		log.Fatalf("erro ao criar o pool de conexões: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("erro ao conectar no banco: %v", err)
	}

	log.Println("conectado no Postgres com sucesso")
}
