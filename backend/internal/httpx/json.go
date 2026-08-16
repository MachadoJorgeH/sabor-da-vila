package httpx

import (
	"encoding/json"
	"net/http"
)

func EscreverJSON(w http.ResponseWriter, status int, dados any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(dados)
}

func LerJSON(w http.ResponseWriter, r *http.Request, destino any) error {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	if err := dec.Decode(destino); err != nil{
		return RequisicaoInvalida("corpo da requisição inválido: " + err.Error())
	}
	return nil
}