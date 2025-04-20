// handlers/auth_handler.go
package handlers

import (
	"ProtocolManager/backend/models"
	_ "ProtocolManager/backend/models"
	"ProtocolManager/backend/repository"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	Repo      *repository.UserRepository
	JWTSecret []byte
}

func NewAuthHandler(
	repo *repository.UserRepository, secret string,
) *AuthHandler {
	return &AuthHandler{Repo: repo, JWTSecret: []byte(secret)}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	user, err := h.Repo.GetByEmail(input.Email)
	if err != nil {
		c.JSON(
			http.StatusUnauthorized, gin.H{"error": "Usuário não encontrado"},
		)
		return
	}

	if !user.Active {
		c.JSON(http.StatusForbidden, gin.H{"error": "Usuário inativo"})
		return
	}

	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash), []byte(input.Password),
	); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Senha incorreta"})
		return
	}

	// Geração do JWT
	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id": user.UserID,
			"role":    user.Role,
			"exp":     time.Now().Add(time.Hour * 24).Unix(),
		},
	)

	tokenString, err := token.SignedString(h.JWTSecret)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Erro ao gerar token"},
		)
		return
	}

	c.JSON(
		http.StatusOK, gin.H{
			"token": tokenString,
			"user": gin.H{
				"user_id": user.UserID,
				"email":   user.Email,
				"role":    user.Role,
			},
		},
	)
}

// handlers/auth_handler.go
func (h *AuthHandler) Register(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
		Role     string `json:"role"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{"error": "Dados inválidos: " + err.Error()},
		)
		return
	}

	// Verifica se o usuário já existe
	_, err := h.Repo.GetByEmail(input.Email)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "E-mail já cadastrado"})
		return
	}

	// Hash da senha
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(input.Password), bcrypt.DefaultCost,
	)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Erro ao criptografar a senha"},
		)
		return
	}

	user := models.User{
		Email:        input.Email,
		PasswordHash: string(hashedPassword),
		Role:         input.Role,
		Active:       true,
	}

	if err := h.Repo.Create(user); err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Erro ao criar usuário"},
		)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Usuário criado com sucesso"})
}
