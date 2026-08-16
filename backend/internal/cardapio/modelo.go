package cardapio

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

var ErrValidacao = errors.New("dados inválidos")

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
		return fmt.Errorf("%w: nome é obrigatório", ErrValidacao)
	}
	if e.PrecoCentavos < 0 {
		return fmt.Errorf("%w: preço não pode ser negativo", ErrValidacao)
	}

	if !categoriasValidas[e.Categoria] {
		return fmt.Errorf("%w: categoria inválida", ErrValidacao)
	}
	return nil
}
