package config

import (
	"fmt"
	"os"
)

type Config struct {
	PortaHTTP string
	DatabaseURL string
}

func Carregar() (Config, error) {
	cfg := Config{
		PortaHTTP: valorOuPadrao("PORTA_HTTP", "8080"),
		DatabaseURL: os.Getenv("DATABASE_URL"),
	}

	if cfg.DatabaseURL == "" {
		return Config{}, fmt.Errorf("variável de ambiente obrigatória não definida: DATABASE_URL")
	}

	return cfg, nil
}

func valorOuPadrao(chave, padrao string) string {
	if valor := os.Getenv(chave); valor != "" {
		return valor
	}
	return padrao
}