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