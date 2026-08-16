package cardapio

import (
	"context"

	"github.com/google/uuid"
)

type Servico struct {
	repo *Repositorio
}

func NovoServico(repo *Repositorio) *Servico {
	return &Servico{repo: repo}
}

func (s *Servico) Listar(ctx context.Context) ([]Item, error){
	return s.repo.Listar(ctx)
}

func (s *Servico) BuscarPorID(ctx context.Context, id uuid.UUID) (Item, error){
	return s.repo.BuscarPorID(ctx, id)
}

func (s *Servico) Criar(ctx context.Context, entrada EntradaItem) (Item, error){
	if err := entrada.Validar(); err != nil{
		return Item{}, err
	}
	return s.repo.Criar(ctx, entrada)
}

func (s *Servico) Atualizar(ctx context.Context, id uuid.UUID, entrada EntradaItem) (Item, error){
	if err := entrada.Validar(); err !=nil {
		return Item{}, err
	}
	return s.repo.Atualizar(ctx, id, entrada)
}

func (s *Servico) Remover(ctx context.Context, id uuid.UUID) error {
	return s.repo.Desativar(ctx, id)
}