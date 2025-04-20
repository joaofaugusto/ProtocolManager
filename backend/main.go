// backend/main.go
package main

import (
	"ProtocolManager/backend/config"
	"ProtocolManager/backend/models"
	"database/sql"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"ProtocolManager/backend/handlers"
	"ProtocolManager/backend/repository"
)

func main() {
	cfg := config.NewConfig()
	// Connection string
	dsn := "host=localhost user=postgres password=123 dbname=protocol port=5432 sslmode=disable"

	// Connect using standard SQL for BranchRepository
	sqlDB, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal("Error connecting to database (SQL): ", err)
	}
	defer sqlDB.Close()

	// Connect using GORM for PersonnelRepository
	gormDB, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Error connecting to database (GORM): ", err)
	}

	// Initialize repositories with appropriate DB connections
	branchRepo := repository.NewBranchRepository(sqlDB)
	personnelRepo := repository.NewPersonnelRepository(gormDB)

	// Initialize handlers
	branchHandler := handlers.NewBranchHandler(branchRepo)
	personnelHandler := handlers.NewPersonnelHandler(personnelRepo)

	// In main.go, add after your existing repository and handler declarations:
	customerRepo := repository.NewCustomerRepository(gormDB)
	customerHandler := handlers.NewCustomerHandler(customerRepo)

	// Add after your other repository initializations
	protocolHistoryRepo := repository.NewProtocolHistoryRepository(gormDB)
	protocolAttachmentRepo := repository.NewProtocolAttachmentRepository(gormDB)
	protocolReminderRepo := repository.NewProtocolReminderRepository(gormDB)

	// Add after your other handler initializations
	protocolHistoryHandler := handlers.NewProtocolHistoryHandler(protocolHistoryRepo)
	protocolAttachmentHandler := handlers.NewProtocolAttachmentHandler(protocolAttachmentRepo)
	protocolReminderHandler := handlers.NewProtocolReminderHandler(protocolReminderRepo)

	// Initialize Protocol repository
	protocolRepo := repository.NewProtocolRepository(gormDB)
	protocolHandler := handlers.NewProtocolHandler(protocolRepo)

	protocolStatusRepo := repository.NewProtocolStatusRepository(gormDB)
	protocolStatusHandler := handlers.NewProtocolStatusHandler(protocolStatusRepo)

	// Initialize Gin router
	r := gin.Default()

	// Setup CORS
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// API routes
	r.GET("/api/branches", branchHandler.GetAllBranches)
	r.GET("/api/branches/:id", branchHandler.GetBranchByID)
	r.POST("/api/branches", branchHandler.CreateBranch)
	r.PUT("/api/branches/:id", branchHandler.UpdateBranch)
	r.DELETE("/api/branches/:id", branchHandler.DeleteBranch)

	// Personnel routes
	r.GET("/api/personnel", personnelHandler.GetAllPersonnel)
	r.GET("/api/personnel/:id", personnelHandler.GetPersonnelByID)
	r.POST("/api/personnel", personnelHandler.CreatePersonnel)
	r.PUT("/api/personnel/:id", personnelHandler.UpdatePersonnel)
	r.DELETE("/api/personnel/:id", personnelHandler.DeletePersonnel)

	r.GET("/api/customers", customerHandler.GetAllCustomers)
	r.GET("/api/customers/:id", customerHandler.GetCustomerByID)
	r.POST("/api/customers", customerHandler.CreateCustomer)
	r.PUT("/api/customers/:id", customerHandler.UpdateCustomer)
	r.DELETE("/api/customers/:id", customerHandler.DeleteCustomer)

	r.GET("/api/protocol-history", protocolHistoryHandler.GetAllHistory)
	r.GET("/api/protocol-history/:id", protocolHistoryHandler.GetHistoryByID)
	r.GET(
		"/api/protocols/:id/history",
		protocolHistoryHandler.GetHistoryByProtocolID,
	)
	r.POST("/api/protocol-history", protocolHistoryHandler.CreateHistory)

	// Protocol Attachment routes
	r.GET(
		"/api/protocols/:id/attachments",
		protocolAttachmentHandler.GetAttachmentsByProtocolID,
	)
	r.POST(
		"/api/protocols/:id/attachments",
		protocolAttachmentHandler.UploadAttachment,
	)
	r.DELETE("/api/attachments/:id", protocolAttachmentHandler.DeleteAttachment)

	// Protocol Reminder routes
	r.GET(
		"/api/protocols/:id/reminders",
		protocolReminderHandler.GetRemindersByProtocolID,
	)
	r.GET(
		"/api/reminders/upcoming", protocolReminderHandler.GetUpcomingReminders,
	)
	r.POST(
		"/api/protocols/:id/reminders", protocolReminderHandler.CreateReminder,
	)
	r.PUT("/api/reminders/:id", protocolReminderHandler.UpdateReminder)
	r.PUT(
		"/api/reminders/:id/mark-sent",
		protocolReminderHandler.MarkReminderAsSent,
	)
	r.DELETE("/api/reminders/:id", protocolReminderHandler.DeleteReminder)

	r.GET("/api/protocols", protocolHandler.GetAllProtocols)
	r.GET("/api/protocols/:id", protocolHandler.GetProtocolByID)
	r.POST("/api/protocols", protocolHandler.CreateProtocol)
	r.PUT("/api/protocols/:id", protocolHandler.UpdateProtocol)
	r.DELETE("/api/protocols/:id", protocolHandler.DeleteProtocol)

	r.GET("/api/protocol-statuses", protocolStatusHandler.GetAllStatuses)
	r.GET("/api/protocol-statuses/:id", protocolStatusHandler.GetStatusByID)
	r.POST("/api/protocol-statuses", protocolStatusHandler.CreateStatus)
	r.PUT("/api/protocol-statuses/:id", protocolStatusHandler.UpdateStatus)
	r.DELETE("/api/protocol-statuses/:id", protocolStatusHandler.DeleteStatus)

	fileRepo := repository.NewFileRepository(sqlDB)
	attachmentHandler := handlers.NewAttachmentHandler(fileRepo, cfg)
	r.GET("/api/attachments/:id/download", attachmentHandler.DownloadAttachment)
	// Make sure the table is auto-migrated
	if err := gormDB.AutoMigrate(
		&models.Protocol{},
		&models.ProtocolHistory{},
		&models.ProtocolAttachment{},
		&models.ProtocolReminder{},
		&models.ProtocolStatus{},
		&models.ProtocolType{}, // Add this line
	); err != nil {
		log.Printf("Warning: Migration issue: %v", err)
	}
	var count int64
	if err := gormDB.Model(&models.ProtocolType{}).Count(&count).Error; err != nil {
		log.Printf("Error checking protocol types: %v", err)
	} else if count == 0 {
		defaultType := models.ProtocolType{
			TypeID:      1,
			TypeName:    "Standard",
			Description: "Default protocol type",
		}
		if err := gormDB.Create(&defaultType).Error; err != nil {
			log.Printf("Error creating default protocol type: %v", err)
		}
	}
	userRepo := repository.NewUserRepository(gormDB)
	authHandler := handlers.NewAuthHandler(userRepo, "sua_chave_secreta_aqui")

	r.POST("/api/login", authHandler.Login)
	r.POST("/api/register", authHandler.Register)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	r.Run(":" + port)
}
