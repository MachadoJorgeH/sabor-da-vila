package cardapio

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type Item struct {
	ID            uuid.UUID `json:"id"`
	Nome          string    `json:"nome"`
	PrecoCentavos int64     `json:"precoCentavos"`
	Categoria     string    `json:"categoria"`
	FotoURL       *string   `json:"fotoUrl"`
	Ativo         bool      `json:"ativo"`
	CriadoEm      time.Time `json:"criadoEm"`
	AtualizadoEm  time.Time `json:"atualizadoEm"`
}

type EntradaItem struct {
	Nome          string  `json:"nome"`
	PrecoCentavos int64   `json:"precoCentavos"`
	Categoria     string  `json:"categoria"`
	FotoURL       *string `json:"fotoUrl"`
}

var categoriasValidas = map[string]bool{
	"Lanches":     true,
	"Bebidas":     true,
	"Sobremesas":  true,
	"Pizzas":      true,
	"Prato Feito": true,
}

func (e EntradaItem) Validar() error {
	if e.Nome == "" {
		return errors.New("nome é obrigatório")
	}
	if e.PrecoCentavos < 0 {
		return errors.New("preço não pode ser negativo")
	}

	if !categoriasValidas[e.Categoria] {
		return errors.New("categoria inválida")
	}
	return nil
}
