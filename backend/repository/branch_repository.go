// backend/repository/branch_repository.go
package repository

import (
	"database/sql"
	"time"

	"ProtocolManager/backend/models"
)

// BranchRepository handles database operations for branches
type BranchRepository struct {
	DB *sql.DB
}

// NewBranchRepository creates a new branch repository
func NewBranchRepository(db *sql.DB) *BranchRepository {
	return &BranchRepository{DB: db}
}

// GetAllBranches retrieves all branches from the database
func (r *BranchRepository) GetAllBranches() ([]models.Branch, error) {
	query := `SELECT branch_id, branch_name, branch_code, created_at, updated_at 
              FROM insurance_branches 
              ORDER BY branch_name ASC`

	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var branches []models.Branch
	for rows.Next() {
		var branch models.Branch
		err := rows.Scan(
			&branch.BranchID,
			&branch.BranchName,
			&branch.BranchCode,
			&branch.CreatedAt,
			&branch.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		branches = append(branches, branch)
	}

	return branches, nil
}

// GetBranchByID retrieves a branch by its ID
func (r *BranchRepository) GetBranchByID(id int) (models.Branch, error) {
	query := `SELECT branch_id, branch_name, branch_code, created_at, updated_at 
              FROM insurance_branches 
              WHERE branch_id = $1`

	var branch models.Branch
	err := r.DB.QueryRow(query, id).Scan(
		&branch.BranchID,
		&branch.BranchName,
		&branch.BranchCode,
		&branch.CreatedAt,
		&branch.UpdatedAt,
	)

	return branch, err
}

// CreateBranch creates a new branch
func (r *BranchRepository) CreateBranch(branch models.Branch) (
	models.Branch, error,
) {
	query := `INSERT INTO insurance_branches (branch_name, branch_code) 
              VALUES ($1, $2) 
              RETURNING branch_id, created_at, updated_at`

	err := r.DB.QueryRow(query, branch.BranchName, branch.BranchCode).Scan(
		&branch.BranchID,
		&branch.CreatedAt,
		&branch.UpdatedAt,
	)

	return branch, err
}

// UpdateBranch updates an existing branch
func (r *BranchRepository) UpdateBranch(branch models.Branch) error {
	query := `UPDATE insurance_branches 
              SET branch_name = $1, branch_code = $2, updated_at = $3 
              WHERE branch_id = $4`

	now := time.Now()
	_, err := r.DB.Exec(
		query, branch.BranchName, branch.BranchCode, now, branch.BranchID,
	)

	return err
}

// DeleteBranch deletes a branch by its ID
func (r *BranchRepository) DeleteBranch(id int) error {
	query := `DELETE FROM insurance_branches WHERE branch_id = $1`

	_, err := r.DB.Exec(query, id)

	return err
}
