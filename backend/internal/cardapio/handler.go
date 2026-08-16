package cardapio

import (
	"errors"
	"log"
	"net/http"

	"github.com/MachadoJorgeH/sabor-da-vila/backend/internal/httpx"

	"github.com/google/uuid"
)

type Handler struct {
	servico *Servico
}

func NovoHandler(servico *Servico) *Handler {
	return &Handler{servico: servico}
}

func (h *Handler) RegistrarRotas(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/cardapio", h.listar)
	mux.HandleFunc("POST /api/cardapio", h.criar)
	mux.HandleFunc("PUT /api/cardapio/{id}", h.atualizar)
	mux.HandleFunc("DELETE /api/cardapio/{id}", h.remover)
}

func (h *Handler) listar(w http.ResponseWriter, r *http.Request){
	itens, err := h.servico.Listar(r.Context())
	if err != nil {
		h.tratarErro(w, err)
		return
	}
	httpx.EscreverJSON(w, http.StatusOK, itens)
}

func (h *Handler) criar(w http.ResponseWriter, r *http.Request){
	var entrada EntradaItem
	if err := httpx.LerJSON(w, r, &entrada); err != nil {
		h.tratarErro(w,err)
		return
	}

	item, err := h.servico.Criar(r.Context(), entrada)
	if err != nil{
		h.tratarErro(w, err)
		return
	}
	httpx.EscreverJSON(w, http.StatusCreated, item)
}

func (h *Handler) atualizar(w http.ResponseWriter, r *http.Request){
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil{
		h.tratarErro(w, httpx.RequisicaoInvalida("id inválido"))
		return
	}

	var entrada EntradaItem
	if err := httpx.LerJSON(w, r, &entrada); err != nil{
		h.tratarErro(w,err)
		return
	}

	item, err := h.servico.Atualizar(r.Context(), id, entrada)
	if err != nil {
		h.tratarErro(w, err)
		return
	}
	httpx.EscreverJSON(w, http.StatusOK, item)
}

func (h *Handler) remover(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		h.tratarErro(w, httpx.RequisicaoInvalida("id inválido"))
		return
	}

	if err := h.servico.Remover(r.Context(), id); err != nil {
		h.tratarErro(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) tratarErro(w http.ResponseWriter, err error){
	var erroAPI httpx.ErroAPI
	switch {
	case errors.Is(err, ErrNaoEncontrado):
		httpx.EscreverErro(w, httpx.NaoEncontrado("item não encontrado"))
	case errors.Is(err, ErrValidacao):
		httpx.EscreverErro(w, httpx.RequisicaoInvalida(err.Error()))
	case errors.As(err, &erroAPI):
		httpx.EscreverErro(w, erroAPI)
	default:
		log.Printf("erro interno: %v", err)
		httpx.EscreverErro(w, httpx.Interno("erro interno no servidor"))
	}
}