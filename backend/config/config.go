package config

import (
	"os"
)

type Config struct {
	FileStoragePath string
}

// NewConfig carrega configurações do ambiente ou define valores padrão
func NewConfig() *Config {
	path := os.Getenv("FILE_STORAGE_PATH")
	if path == "" {
		// Caminho padrão para arquivos salvos localmente
		path = "./storage"
	}

	return &Config{
		FileStoragePath: path,
	}
}
