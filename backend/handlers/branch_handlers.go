// backend/handlers/branch_handlers.go
package handlers

import (
	"net/http"
	"strconv"

	"ProtocolManager/backend/models"
	"ProtocolManager/backend/repository"
	"github.com/gin-gonic/gin"
)

// BranchHandler handles HTTP requests for branches
type BranchHandler struct {
	repo *repository.BranchRepository
}

// NewBranchHandler creates a new branch handler
func NewBranchHandler(repo *repository.BranchRepository) *BranchHandler {
	return &BranchHandler{repo: repo}
}

// GetAllBranches handles GET requests to fetch all branches
func (h *BranchHandler) GetAllBranches(c *gin.Context) {
	branches, err := h.repo.GetAllBranches()
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to fetch branches"},
		)
		return
	}

	c.JSON(http.StatusOK, branches)
}

// GetBranchByID handles GET requests to fetch a branch by ID
func (h *BranchHandler) GetBranchByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{"error": "Invalid branch ID"},
		)
		return
	}

	branch, err := h.repo.GetBranchByID(id)
	if err != nil {
		c.JSON(
			http.StatusNotFound,
			gin.H{"error": "Branch not found"},
		)
		return
	}

	c.JSON(http.StatusOK, branch)
}

// CreateBranch handles POST requests to create a new branch
func (h *BranchHandler) CreateBranch(c *gin.Context) {
	var branch models.Branch
	if err := c.ShouldBindJSON(&branch); err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{"error": "Invalid request body"},
		)
		return
	}

	if branch.BranchName == "" {
		c.JSON(
			http.StatusBadRequest,
			gin.H{"error": "Branch name is required"},
		)
		return
	}

	createdBranch, err := h.repo.CreateBranch(branch)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to create branch"},
		)
		return
	}

	c.JSON(http.StatusCreated, createdBranch)
}

// UpdateBranch handles PUT requests to update an existing branch
func (h *BranchHandler) UpdateBranch(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{"error": "Invalid branch ID"},
		)
		return
	}

	var branch models.Branch
	if err := c.ShouldBindJSON(&branch); err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{"error": "Invalid request body"},
		)
		return
	}

	branch.BranchID = id

	if branch.BranchName == "" {
		c.JSON(
			http.StatusBadRequest,
			gin.H{"error": "Branch name is required"},
		)
		return
	}

	err = h.repo.UpdateBranch(branch)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to update branch"},
		)
		return
	}

	c.Status(http.StatusOK)
}

// DeleteBranch handles DELETE requests to remove a branch
func (h *BranchHandler) DeleteBranch(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{"error": "Invalid branch ID"},
		)
		return
	}

	err = h.repo.DeleteBranch(id)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to delete branch"},
		)
		return
	}

	c.Status(http.StatusNoContent)
}
