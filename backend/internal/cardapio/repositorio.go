package cardapio

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNaoEncontrado = errors.New("item não encontrado")
var ErrNomeDuplicado = errors.New("já existe um item ativo com esse nome")

const codigoViolacaoUnica = "23505"

type Repositorio struct {
	db *pgxpool.Pool
}

func NovoRepositorio(db *pgxpool.Pool) *Repositorio {
	return &Repositorio{db: db}
}

func (r *Repositorio) Criar(ctx context.Context, entrada EntradaItem) (Item, error) {
	const sql = `
		INSERT INTO cardapio_itens (nome, preco_centavos, categoria, foto_url)
		VALUES ($1, $2, $3, $4)
		RETURNING id, nome, preco_centavos, categoria, foto_url, ativo, criado_em, atualizado_em`

	var item Item
	err := r.db.QueryRow(ctx, sql, entrada.Nome, entrada.PrecoCentavos, entrada.Categoria, entrada.FotoURL).Scan(
		&item.ID, &item.Nome, &item.PrecoCentavos, &item.Categoria, &item.FotoURL, &item.Ativo, &item.CriadoEm, &item.AtualizadoEm,
	)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == codigoViolacaoUnica{
			return Item{}, ErrNomeDuplicado
		}
		return Item{}, err
	}
	return item, nil
}

func (r *Repositorio) Listar(ctx context.Context) ([]Item, error) {
	const sql = `
		SELECT id, nome, preco_centavos, categoria, foto_url, ativo, criado_em, atualizado_em
		FROM cardapio_itens
		WHERE ativo
		ORDER BY categoria, nome`

	linhas, err := r.db.Query(ctx, sql)
	if err != nil {
		return nil, err
	}
	defer linhas.Close()

	itens := []Item{}
	for linhas.Next() {
		var item Item
		err := linhas.Scan(
			&item.ID, &item.Nome, &item.PrecoCentavos, &item.Categoria, &item.FotoURL, &item.Ativo, &item.CriadoEm, &item.AtualizadoEm,
		)
		if err != nil {
			return nil, err
		}
		itens = append(itens, item)
	}
	if err := linhas.Err(); err != nil {
		return nil, err
	}
	return itens, nil
}

func (r *Repositorio) BuscarPorID(ctx context.Context, id uuid.UUID) (Item, error) {
	const sql = `
		SELECT id, nome, preco_centavos, categoria, foto_url, ativo, criado_em, atualizado_em
		FROM cardapio_itens
		WHERE id = $1`

	var item Item
	err := r.db.QueryRow(ctx, sql, id).Scan(
		&item.ID, &item.Nome, &item.PrecoCentavos, &item.Categoria, &item.FotoURL, &item.Ativo, &item.CriadoEm, &item.AtualizadoEm,
	)
	if errors.Is(err, pgx.ErrNoRows){
		return Item{}, ErrNaoEncontrado
	}
	if err != nil{
		return Item{}, err
	}
	return item, nil
}

func (r *Repositorio) Atualizar(ctx context.Context, id uuid.UUID, entrada EntradaItem) (Item, error) {
	const sql = `
		UPDATE cardapio_itens
		SET nome = $2, preco_centavos = $3, categoria = $4, foto_url = $5, atualizado_em = now()
		WHERE id = $1
		RETURNING id, nome, preco_centavos, categoria, foto_url, ativo, criado_em, atualizado_em`
	
		var item Item
		err := r.db.QueryRow(ctx, sql, id, entrada.Nome, entrada.PrecoCentavos, entrada.Categoria, entrada.FotoURL,).Scan(
			&item.ID, &item.Nome, &item.PrecoCentavos, &item.Categoria, &item.FotoURL, &item.Ativo, &item.CriadoEm, &item.AtualizadoEm,
		)

		if errors.Is(err, pgx.ErrNoRows){
			return Item{}, ErrNaoEncontrado
		}

		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == codigoViolacaoUnica{
				return Item{}, ErrNomeDuplicado
			}
			return Item{}, err
		}
		return item, nil
}

func (r *Repositorio) Desativar(ctx context.Context, id uuid.UUID) error{
	const sql = `UPDATE cardapio_itens SET ativo = false, atualizado_em = now() WHERE id = $1`

	tag, err := r.db.Exec(ctx, sql, id)
	if err != nil{
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNaoEncontrado
	}
	return nil
}