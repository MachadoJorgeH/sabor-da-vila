package httpx

import "net/http"

type ErroAPI struct {
	Status int `json:"-"`
	Codigo string `json:"codigo"`
	Mensagem string `json:"mensagem"`
}

func (e ErroAPI) Error() string {
	return e.Mensagem
}

func EscreverErro(w http.ResponseWriter, erro ErroAPI) {
	EscreverJSON(w, erro.Status, map[string]any{"erro": erro})
}

func RequisicaoInvalida(mensagem string) ErroAPI {
	return ErroAPI{Status: http.StatusBadRequest, Codigo: "requisicao_invalida", Mensagem: mensagem}
}

func NaoEncontrado(mensagem string) ErroAPI {
	return ErroAPI{Status: http.StatusNotFound, Codigo: "nao_encontrado", Mensagem: mensagem}
}

func Interno(mensagem string) ErroAPI {
	return ErroAPI{Status: http.StatusInternalServerError, Codigo: "erro_interno", Mensagem: mensagem}
}