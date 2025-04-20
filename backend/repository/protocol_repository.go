// backend/repository/protocol_repository.go
package repository

import (
	"ProtocolManager/backend/models"
	"fmt"
	"gorm.io/gorm"
	"time"
)

type ProtocolRepository struct {
	DB *gorm.DB
}

func NewProtocolRepository(db *gorm.DB) *ProtocolRepository {
	return &ProtocolRepository{DB: db}
}

func (r *ProtocolRepository) GetAll() ([]models.Protocol, error) {
	var protocols []models.Protocol

	result := r.DB.
		Preload("Type").
		Preload("Status").
		Preload("Customer").
		Preload("Branch").
		Preload("Requestor").
		Preload("AssignedAgent").
		Preload("CreatedByAgent").
		Find(&protocols)

	if result.Error != nil {
		return nil, result.Error
	}

	return protocols, nil
}

func (r *ProtocolRepository) GetByID(id int) (models.Protocol, error) {
	var protocol models.Protocol
	result := r.DB.
		Preload("Type").
		Preload("Status").
		Preload("Customer").
		Preload("Branch").
		Preload("Requestor").
		Preload("AssignedAgent").
		Preload("CreatedByAgent").
		First(&protocol, id)
	return protocol, result.Error
}

// backend/repository/protocol_repository.go
func (r *ProtocolRepository) Create(protocol models.Protocol) (
	models.Protocol, error,
) {
	// Set a default type_id if not provided or if it's zero
	if protocol.TypeID == 0 {
		// Get the first available type from the database
		var defaultType models.ProtocolType
		if err := r.DB.First(&defaultType).Error; err != nil {
			return protocol, fmt.Errorf("no protocol types available: %w", err)
		}
		protocol.TypeID = defaultType.TypeID
	}

	// Ensure we have a valid created_by
	if protocol.CreatedBy == 0 {
		var personnel models.SalesPersonnel
		if err := r.DB.First(&personnel).Error; err != nil {
			return protocol, fmt.Errorf(
				"no personnel available for created_by: %w", err,
			)
		}
		protocol.CreatedBy = personnel.PersonnelID
	}

	// Generate protocol number
	currentYear := time.Now().Year()
	var count int64
	r.DB.Model(&models.Protocol{}).
		Where("EXTRACT(YEAR FROM created_at) = ?", currentYear).
		Count(&count)

	protocol.ProtocolNumber = fmt.Sprintf("%d-%04d", currentYear, count+1)

	// Create the protocol
	result := r.DB.Create(&protocol)
	if result.Error != nil {
		return protocol, result.Error
	}

	// Create initial history record
	history := models.ProtocolHistory{
		ProtocolID:  protocol.ProtocolID,
		NewStatusID: protocol.StatusID,
		Notes:       "Protocol created",
		CreatedBy:   protocol.CreatedBy,
	}

	r.DB.Create(&history)

	// Fetch the complete protocol with associations
	r.DB.
		Preload("Type").
		Preload("Status").
		Preload("Customer").
		Preload("Branch").
		Preload("Requestor").
		Preload("AssignedAgent").
		Preload("CreatedByAgent").
		First(&protocol, protocol.ProtocolID)

	return protocol, nil
}

// backend/repository/protocol_repository.go
func (r *ProtocolRepository) UpdateFields(
	id int, fields map[string]interface{},
) error {
	// Validação de prioridade, se enviada
	if p, ok := fields["priority"]; ok {
		if pStr, ok := p.(string); ok {
			valid := map[string]bool{"low": true, "medium": true, "high": true}
			if !valid[pStr] {
				return fmt.Errorf("prioridade inválida: %s", pStr)
			}
		}
	}

	// Verificar se vai atualizar o status e gerar histórico se necessário
	if newStatusRaw, ok := fields["status_id"]; ok {
		newStatusID, ok := toInt(newStatusRaw)
		if !ok {
			return fmt.Errorf("status_id inválido")
		}

		var current models.Protocol
		if err := r.DB.First(&current, id).Error; err != nil {
			return err
		}

		if current.StatusID != newStatusID {
			oldStatusID := current.StatusID

			history := models.ProtocolHistory{
				ProtocolID:  current.ProtocolID,
				OldStatusID: &oldStatusID,
				NewStatusID: newStatusID,
				CreatedBy:   current.CreatedBy, // ou 0 por enquanto
			}

			if err := r.DB.Create(&history).Error; err != nil {
				return err
			}

			var newStatus models.ProtocolStatus
			if err := r.DB.First(&newStatus, newStatusID).Error; err != nil {
				return err
			}

			if newStatus.IsTerminal {
				fields["closed_at"] = time.Now()
			}
		}
	}

	// Executar update
	return r.DB.Model(&models.Protocol{}).Where(
		"protocol_id = ?", id,
	).Updates(fields).Error
}

// Função auxiliar para garantir que qualquer tipo seja convertido corretamente em int
func toInt(val interface{}) (int, bool) {
	switch v := val.(type) {
	case float64:
		return int(v), true
	case int:
		return v, true
	case int64:
		return int(v), true
	default:
		return 0, false
	}
}

func (r *ProtocolRepository) Delete(id int) error {
	// Delete attachments
	if err := r.DB.Where(
		"protocol_id = ?", id,
	).Delete(&models.ProtocolAttachment{}).Error; err != nil {
		return err
	}

	// Delete reminders (se aplicável)
	if err := r.DB.Where(
		"protocol_id = ?", id,
	).Delete(&models.ProtocolReminder{}).Error; err != nil {
		return err
	}

	// Delete history
	if err := r.DB.Where(
		"protocol_id = ?", id,
	).Delete(&models.ProtocolHistory{}).Error; err != nil {
		return err
	}

	// Delete the protocol itself
	return r.DB.Delete(&models.Protocol{}, id).Error
}

// Additional useful methods

func (r *ProtocolRepository) GetByStatus(statusID int) (
	[]models.Protocol, error,
) {
	var protocols []models.Protocol
	result := r.DB.
		Preload("Type").
		Preload("Status").
		Preload("Customer").
		Preload("Branch").
		Preload("Requestor").
		Preload("AssignedAgent").
		Where("status_id = ?", statusID).
		Order("created_at DESC").
		Find(&protocols)
	return protocols, result.Error
}

func (r *ProtocolRepository) GetHistory(protocolID int) (
	[]models.ProtocolHistory, error,
) {
	var history []models.ProtocolHistory
	result := r.DB.
		Preload("PreviousStatus").
		Preload("NewStatus").
		Preload("CreatedByAgent").
		Where("protocol_id = ?", protocolID).
		Order("created_at").
		Find(&history)
	return history, result.Error
}
